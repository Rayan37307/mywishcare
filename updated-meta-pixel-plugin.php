<?php
/**
 * Plugin Name: Meta Pixel Custom
 * Description: Provide server-side Meta Pixel support
 * Version: 1.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Add server-side Meta Pixel tracking endpoints
 */
add_action('rest_api_init', function () {
    // Endpoint to track Meta Pixel events server-side
    register_rest_route('meta-pixel/v1', '/track', array(
        'methods' => 'POST',
        'callback' => 'track_meta_pixel_event',
        'permission_callback' => '__return_true',
    ));

    register_rest_route('meta-pixel/v1', '/purchase', array(
        'methods' => 'POST',
        'callback' => 'track_meta_pixel_purchase',
        'permission_callback' => '__return_true',
    ));
});

/**
 * Main function to track Meta Pixel events server-side
 */
function track_meta_pixel_event($request) {
    $event_name = sanitize_text_field($request->get_param('event_name'));
    $event_id = sanitize_text_field($request->get_param('event_id'));
    $user_data = $request->get_param('user_data');
    $custom_data = $request->get_param('custom_data');
    $test_event_code = sanitize_text_field($request->get_param('test_event_code'));

    if (empty($event_name)) {
        return new WP_Error('missing_event_name', 'Event name is required', array('status' => 400));
    }

    if (empty($user_data) && empty($custom_data)) {
        return new WP_Error('missing_data', 'Either user_data or custom_data is required', array('status' => 400));
    }

    // Get Meta Pixel ID from WordPress options or environment
    $pixel_id = get_option('meta_pixel_id', '');
    $access_token = get_option('meta_pixel_access_token', '');

    if (empty($pixel_id) || empty($access_token)) {
        $pixel_id = defined('META_PIXEL_ID') ? META_PIXEL_ID : '';
        $access_token = defined('META_PIXEL_ACCESS_TOKEN') ? META_PIXEL_ACCESS_TOKEN : '';

        if (empty($pixel_id) || empty($access_token)) {
            return new WP_Error('missing_credentials', 'Meta Pixel ID and Access Token are required', array('status' => 400));
        }
    }

    $event_data = prepare_meta_pixel_event(
        $event_name,
        $event_id ?: generate_event_id(),
        $user_data,
        $custom_data,
        $test_event_code
    );

    // Send the event to Meta Pixel server
    $response = send_meta_pixel_event($event_data, $pixel_id, $access_token, $test_event_code);

    if (is_wp_error($response)) {
        return $response;
    }

    error_log("Meta Pixel Event Tracked: " . $event_name . " - Response: " . json_encode($response));

    return array(
        'success' => true,
        'event_name' => $event_name,
        'response' => $response
    );
}

/**
 * Track purchase events server-side
 */
function track_meta_pixel_purchase($request) {
    $order_id = sanitize_text_field($request->get_param('order_id'));
    $currency = sanitize_text_field($request->get_param('currency')) ?: 'USD';
    $value = floatval($request->get_param('value'));
    $contents = $request->get_param('contents');
    $user_data = $request->get_param('user_data');
    $test_event_code = sanitize_text_field($request->get_param('test_event_code'));

    // Validate required parameters
    if (empty($order_id) || empty($value) || empty($contents)) {
        return new WP_Error('missing_required_fields', 'Order ID, value, and contents are required for purchase tracking', array('status' => 400));
    }

    // Get Meta Pixel credentials
    $pixel_id = get_option('meta_pixel_id', '');
    $access_token = get_option('meta_pixel_access_token', '');

    if (empty($pixel_id) || empty($access_token)) {
        $pixel_id = defined('META_PIXEL_ID') ? META_PIXEL_ID : '';
        $access_token = defined('META_PIXEL_ACCESS_TOKEN') ? META_PIXEL_ACCESS_TOKEN : '';

        if (empty($pixel_id) || empty($access_token)) {
            return new WP_Error('missing_credentials', 'Meta Pixel ID and Access Token are required', array('status' => 400));
        }
    }

    $event_data = prepare_meta_pixel_purchase_event(
        $order_id,
        $currency,
        $value,
        $contents,
        $user_data,
        $test_event_code
    );

    // Send the purchase event to Meta Pixel server
    $response = send_meta_pixel_event($event_data, $pixel_id, $access_token, $test_event_code);

    if (is_wp_error($response)) {
        return $response;
    }

    error_log("Meta Pixel Purchase Tracked: Order #{$order_id} - Value: {$value} {$currency}");

    return array(
        'success' => true,
        'order_id' => $order_id,
        'response' => $response
    );
}

/**
 * Prepare event data for Meta Pixel server-side tracking
 */
function prepare_meta_pixel_event($event_name, $event_id, $user_data, $custom_data, $test_event_code = null) {
    // Get client IP address
    $client_ip = get_real_client_ip();
    
    // Get user agent
    $user_agent = sanitize_text_field($_SERVER['HTTP_USER_AGENT'] ?? '');
    
    // Prepare the event data structure for Meta Pixel
    $event_data = array(
        array(
            'event_name' => $event_name,
            'event_time' => time(),
            'event_id' => $event_id,
            'action_source' => 'website',
            'event_source_url' => esc_url_raw(get_permalink()),
            'user_data' => prepare_meta_user_data($user_data),
            'custom_data' => $custom_data ?: array(),
        )
    );

    // Only include optional fields if they exist
    if (!empty($client_ip)) {
        $event_data[0]['user_data']['client_ip_address'] = $client_ip;
    }
    
    if (!empty($user_agent)) {
        $event_data[0]['user_data']['client_user_agent'] = $user_agent;
    }

    return $event_data;
}

/**
 * Prepare purchase event data for Meta Pixel server-side tracking
 */
function prepare_meta_pixel_purchase_event($order_id, $currency, $value, $contents, $user_data, $test_event_code = null) {
    // Get client IP address
    $client_ip = get_real_client_ip();
    
    // Get user agent
    $user_agent = sanitize_text_field($_SERVER['HTTP_USER_AGENT'] ?? '');
    
    // Prepare the event data structure for Meta Pixel
    $event_data = array(
        array(
            'event_name' => 'Purchase',
            'event_time' => time(),
            'event_id' => generate_event_id(),
            'action_source' => 'website',
            'event_source_url' => esc_url_raw(get_permalink()),
            'user_data' => prepare_meta_user_data($user_data),
            'custom_data' => array(
                'currency' => $currency,
                'value' => $value,
                'contents' => $contents,
                'order_id' => $order_id,
            ),
        )
    );

    // Only include optional fields if they exist
    if (!empty($client_ip)) {
        $event_data[0]['user_data']['client_ip_address'] = $client_ip;
    }
    
    if (!empty($user_agent)) {
        $event_data[0]['user_data']['client_user_agent'] = $user_agent;
    }

    return $event_data;
}

/**
 * Prepare user data for Meta Pixel (with privacy considerations)
 */
function prepare_meta_user_data($user_data) {
    $meta_user_data = array();
    
    if (is_array($user_data)) {
        // Hash PII data as per Meta requirements
        if (isset($user_data['email'])) {
            $meta_user_data['em'] = hash('sha256', strtolower(trim($user_data['email'])));
        }
        
        if (isset($user_data['phone'])) {
            $meta_user_data['ph'] = hash('sha256', preg_replace('/[^0-9]/', '', $user_data['phone']));
        }
        
        if (isset($user_data['first_name'])) {
            $meta_user_data['fn'] = hash('sha256', strtolower(trim($user_data['first_name'])));
        }
        
        if (isset($user_data['last_name'])) {
            $meta_user_data['ln'] = hash('sha256', strtolower(trim($user_data['last_name'])));
        }
        
        if (isset($user_data['city'])) {
            $meta_user_data['ct'] = hash('sha256', strtolower(trim($user_data['city'])));
        }
        
        if (isset($user_data['state'])) {
            $meta_user_data['st'] = hash('sha256', strtoupper(trim($user_data['state'])));
        }
        
        if (isset($user_data['country'])) {
            $meta_user_data['country'] = hash('sha256', strtolower(trim($user_data['country'])));
        }
        
        if (isset($user_data['zip'])) {
            $meta_user_data['zp'] = hash('sha256', trim($user_data['zip']));
        }
    }

    // Include IP and user agent (Meta Pixel requires this for location detection)
    $meta_user_data['client_ip_address'] = get_real_client_ip();
    $meta_user_data['client_user_agent'] = sanitize_text_field($_SERVER['HTTP_USER_AGENT'] ?? '');

    return $meta_user_data;
}

/**
 * Send event to Meta Pixel server
 */
function send_meta_pixel_event($event_data, $pixel_id, $access_token, $test_event_code = null) {
    // Meta Pixel server-side API endpoint
    $api_url = "https://graph.facebook.com/v18.0/{$pixel_id}/events?access_token={$access_token}";
    
    // If test event code is provided, add it to the URL
    if ($test_event_code) {
        $api_url .= '&test_event_code=' . $test_event_code;
    }

    // Prepare the request body
    $body = array(
        'data' => $event_data,
    );

    // Make the HTTP request
    $response = wp_remote_post($api_url, array(
        'headers' => array(
            'Content-Type' => 'application/json',
        ),
        'body' => wp_json_encode($body),
        'timeout' => 30,
    ));

    // Check for errors
    if (is_wp_error($response)) {
        error_log("Meta Pixel Error: " . $response->get_error_message());
        return $response;
    }

    $response_code = wp_remote_retrieve_response_code($response);
    $response_body = wp_remote_retrieve_body($response);

    if ($response_code !== 200) {
        $error_message = "Meta Pixel API returned HTTP code {$response_code}: {$response_body}";
        error_log($error_message);
        return new WP_Error('meta_pixel_api_error', $error_message, array('status' => $response_code));
    }

    $response_data = json_decode($response_body, true);

    if (isset($response_data['error'])) {
        $error_message = "Meta Pixel API Error: " . $response_data['error']['message'];
        error_log($error_message);
        return new WP_Error('meta_pixel_api_error', $error_message, array('status' => $response_code));
    }

    return $response_data;
}

/**
 * Get real client IP address
 */
function get_real_client_ip() {
    $ip_keys = array('HTTP_CF_CONNECTING_IP', 'HTTP_CLIENT_IP', 'HTTP_X_FORWARDED_FOR', 'HTTP_X_FORWARDED', 'HTTP_X_CLUSTER_CLIENT_IP', 'HTTP_FORWARDED_FOR', 'HTTP_FORWARDED', 'REMOTE_ADDR');
    
    foreach ($ip_keys as $key) {
        if (array_key_exists($key, $_SERVER) === true) {
            foreach (explode(',', $_SERVER[$key]) as $ip) {
                $ip = trim($ip);
                if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) !== false) {
                    return $ip;
                }
            }
        }
    }

    return filter_var($_SERVER['REMOTE_ADDR'] ?? '', FILTER_VALIDATE_IP) ?: '';
}

/**
 * Generate unique event ID
 */
function generate_event_id() {
    return 'event_' . uniqid() . '_' . time() . '_' . rand(1000, 9999);
}

/**
 * Add admin settings page for Meta Pixel configuration
 */
add_action('admin_menu', 'meta_pixel_settings_page');

function meta_pixel_settings_page() {
    add_options_page(
        'Meta Pixel Settings',
        'Meta Pixel',
        'manage_options',
        'meta-pixel-settings',
        'meta_pixel_settings_page_html'
    );
}

function meta_pixel_settings_page_html() {
    // Check if user has permission
    if (!current_user_can('manage_options')) {
        return;
    }

    // Handle form submission
    if (isset($_GET['settings-updated']) && $_GET['settings-updated']) {
        $pixel_id = sanitize_text_field($_POST['meta_pixel_id']);
        $access_token = sanitize_text_field($_POST['meta_pixel_access_token']);

        update_option('meta_pixel_id', $pixel_id);
        update_option('meta_pixel_access_token', $access_token);
    }

    $pixel_id = get_option('meta_pixel_id', '');
    $access_token = get_option('meta_pixel_access_token', '');
    ?>

    <div class="wrap">
        <h1>Meta Pixel Settings</h1>

        <form method="post" action="options.php">
            <?php settings_fields('meta_pixel_settings'); ?>
            <?php do_settings_sections('meta_pixel_settings'); ?>
            
            <table class="form-table">
                <tr>
                    <th scope="row"><label for="meta_pixel_id">Meta Pixel ID</label></th>
                    <td>
                        <input name="meta_pixel_id" type="text" id="meta_pixel_id" value="<?php echo esc_attr($pixel_id); ?>" class="regular-text" />
                        <p class="description">Enter your Meta Pixel ID (starts with "1234567890...")</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="meta_pixel_access_token">Meta Access Token</label></th>
                    <td>
                        <input name="meta_pixel_access_token" type="password" id="meta_pixel_access_token" value="<?php echo esc_attr($access_token); ?>" class="regular-text" />
                        <p class="description">Your Meta Access Token with "business_management" and "ads_management" permissions</p>
                    </td>
                </tr>
            </table>

            <?php submit_button(); ?>
        </form>

        <div class="card">
            <h2>How to Get Your Meta Pixel ID and Access Token</h2>
            <ol>
                <li>Go to <a href="https://www.facebook.com/events_manager2/" target="_blank">Meta Events Manager</a></li>
                <li>Find or create your Pixel</li>
                <li>Copy the Pixel ID (e.g., "123456789012345")</li>
                <li>Go to <a href="https://developers.facebook.com/" target="_blank">Meta for Developers</a></li>
                <li>Create an app or use an existing one</li>
                <li>Go to Settings > Basic and copy your App ID</li>
                <li>Create an access token with "business_management" and "ads_management" permissions</li>
            </ol>
        </div>
    </div>
    <?php
}

// Register settings
add_action('admin_init', function() {
    register_setting('meta_pixel_settings', 'meta_pixel_id');
    register_setting('meta_pixel_settings', 'meta_pixel_access_token');
});

/**
 * Enable CORS for the Meta Pixel endpoints so they can be called from React app
 */
add_action('rest_api_init', function () {
    add_filter('rest_pre_serve_request', function ($served, $result, $request, $server) {
        if (strpos($request->get_route(), '/wp-json/meta-pixel/') !== false) {
            header('Access-Control-Allow-Origin: *');
            header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
            header('Access-Control-Allow-Headers: Content-Type, Authorization');
        }
        return $served;
    }, 10, 4);
});

/**
 * Handle preflight OPTIONS requests for CORS
 */
add_action('init', function() {
    if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS' && 
        isset($_SERVER['REQUEST_URI']) && strpos($_SERVER['REQUEST_URI'], 'wp-json/meta-pixel/') !== false) {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        exit(0);
    }
});
<?php
/**
 * Server-Side Meta Pixel Tracking Implementation for WordPress
 * 
 * This file provides server-side Meta Pixel tracking capabilities to complement
 * your existing client-side tracking. Server-side tracking offers several advantages:
 * 
 * 1. Improved reliability (works even with ad blockers)
 * 2. Better privacy compliance (can exclude sensitive data)
 * 3. Accurate conversion tracking
 * 4. Enhanced attribution modeling
 */

// Add server-side Meta Pixel tracking endpoints
add_action('rest_api_init', function () {
    // Endpoint to track Meta Pixel events server-side
    register_rest_route('meta-pixel/v1', '/track', array(
        'methods' => 'POST',
        'callback' => 'track_meta_pixel_event',
        'permission_callback' => '__return_true', // Allow from React app
    ));
    
    // Endpoint to track purchase events specifically
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
    $params = $request->get_params();
    
    // Get required parameters
    $event_name = sanitize_text_field($params['event_name']);
    $event_id = sanitize_text_field($params['event_id'] ?? '');
    $user_data = $params['user_data'] ?? array();
    $custom_data = $params['custom_data'] ?? array();
    
    // Validate required parameters
    if (empty($event_name)) {
        return new WP_Error('missing_event_name', 'Event name is required', array('status' => 400));
    }
    
    // Get Meta Pixel ID from WordPress options or environment
    $pixel_id = get_option('meta_pixel_id', '');
    $access_token = get_option('meta_pixel_access_token', '');
    
    if (empty($pixel_id) || empty($access_token)) {
        // Try to get from constants if not in options
        $pixel_id = defined('META_PIXEL_ID') ? META_PIXEL_ID : '';
        $access_token = defined('META_PIXEL_ACCESS_TOKEN') ? META_PIXEL_ACCESS_TOKEN : '';
        
        if (empty($pixel_id) || empty($access_token)) {
            return new WP_Error('missing_credentials', 'Meta Pixel ID and Access Token are required', array('status' => 400));
        }
    }
    
    // Prepare the event data for server-side tracking
    $event_data = prepare_meta_pixel_event(
        $event_name,
        $event_id,
        $user_data,
        $custom_data
    );
    
    // Send the event to Meta Pixel server
    $response = send_meta_pixel_event($event_data, $pixel_id, $access_token);
    
    if (is_wp_error($response)) {
        return $response;
    }
    
    // Log the event for debugging purposes
    error_log("Meta Pixel Event Tracked: " . $event_name . " - Response: " . json_encode($response));
    
    return array(
        'success' => true,
        'message' => 'Event tracked successfully',
        'event_name' => $event_name,
        'event_id' => $event_id,
        'timestamp' => current_time('mysql')
    );
}

/**
 * Specialized function to track purchase events
 */
function track_meta_pixel_purchase($request) {
    $params = $request->get_params();
    
    // Get required parameters for purchase event
    $order_id = sanitize_text_field($params['order_id']);
    $currency = sanitize_text_field($params['currency'] ?? 'USD');
    $value = floatval($params['value'] ?? 0);
    $contents = $params['contents'] ?? array(); // Array of purchased items
    $user_data = $params['user_data'] ?? array();
    
    // Validate required parameters
    if (empty($order_id)) {
        return new WP_Error('missing_order_id', 'Order ID is required for purchase tracking', array('status' => 400));
    }
    
    if ($value <= 0) {
        return new WP_Error('invalid_value', 'Purchase value must be greater than 0', array('status' => 400));
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
    
    // Prepare the purchase event data
    $event_data = prepare_meta_pixel_purchase_event(
        $order_id,
        $currency,
        $value,
        $contents,
        $user_data
    );
    
    // Send the purchase event to Meta Pixel server
    $response = send_meta_pixel_event($event_data, $pixel_id, $access_token);
    
    if (is_wp_error($response)) {
        return $response;
    }
    
    // Log the purchase event
    error_log("Meta Pixel Purchase Tracked: Order #{$order_id} - Value: {$value} {$currency}");
    
    return array(
        'success' => true,
        'message' => 'Purchase tracked successfully',
        'order_id' => $order_id,
        'value' => $value,
        'currency' => $currency,
        'timestamp' => current_time('mysql')
    );
}

/**
 * Prepare event data for Meta Pixel server-side tracking
 */
function prepare_meta_pixel_event($event_name, $event_id, $user_data, $custom_data) {
    // Get the client IP (respecting proxy headers)
    $client_ip = get_real_client_ip();
    
    // Get user agent
    $user_agent = sanitize_text_field($_SERVER['HTTP_USER_AGENT'] ?? '');
    
    // Create event ID if not provided (using a combination of event name and timestamp)
    if (empty($event_id)) {
        $event_id = uniqid($event_name . '_', true);
    }
    
    // Prepare the event data structure for Meta Pixel
    $event = array(
        'event_name' => $event_name,
        'event_time' => time(),
        'event_id' => $event_id,
        'action_source' => 'website',
        'event_source_url' => sanitize_url($_SERVER['HTTP_REFERER'] ?? home_url()),
        'user_data' => prepare_meta_user_data($user_data),
        'custom_data' => $custom_data,
    );
    
    // Add device information if available
    $event['device_info'] = array(
        'w' => intval($_POST['screen_width'] ?? $_GET['screen_width'] ?? 0),
        'h' => intval($_POST['screen_height'] ?? $_GET['screen_height'] ?? 0),
        'tz' => intval(get_option('gmt_offset', 0) * -60), // Timezone offset in minutes
    );
    
    return array($event);
}

/**
 * Prepare purchase event data for Meta Pixel server-side tracking
 */
function prepare_meta_pixel_purchase_event($order_id, $currency, $value, $contents, $user_data) {
    // Get the client IP
    $client_ip = get_real_client_ip();
    
    // Create a unique event ID for this purchase
    $event_id = uniqid('purchase_' . $order_id . '_', true);
    
    // Prepare the purchase event data
    $event = array(
        'event_name' => 'Purchase',
        'event_time' => time(),
        'event_id' => $event_id,
        'action_source' => 'website',
        'event_source_url' => sanitize_url($_SERVER['HTTP_REFERER'] ?? home_url()),
        'user_data' => prepare_meta_user_data($user_data),
        'custom_data' => array(
            'currency' => $currency,
            'value' => $value,
            'contents' => $contents,
            'order_id' => $order_id,
        ),
    );
    
    return array($event);
}

/**
 * Prepare user data for Meta Pixel (with privacy considerations)
 */
function prepare_meta_user_data($user_data) {
    $meta_user_data = array();
    
    // Only include hashed data (for privacy compliance)
    if (!empty($user_data['email'])) {
        $meta_user_data['em'] = hash('sha256', strtolower(trim($user_data['email'])));
    }
    
    if (!empty($user_data['phone'])) {
        $meta_user_data['ph'] = hash('sha256', preg_replace('/[^0-9]/', '', $user_data['phone']));
    }
    
    if (!empty($user_data['first_name'])) {
        $meta_user_data['fn'] = hash('sha256', strtolower(trim($user_data['first_name'])));
    }
    
    if (!empty($user_data['last_name'])) {
        $meta_user_data['ln'] = hash('sha256', strtolower(trim($user_data['last_name'])));
    }
    
    if (!empty($user_data['city'])) {
        $meta_user_data['ct'] = hash('sha256', strtolower(trim($user_data['city'])));
    }
    
    if (!empty($user_data['state'])) {
        $meta_user_data['st'] = hash('sha256', strtoupper(trim($user_data['state'])));
    }
    
    if (!empty($user_data['country'])) {
        $meta_user_data['country'] = hash('sha256', strtolower(trim($user_data['country'])));
    }
    
    if (!empty($user_data['zip'])) {
        $meta_user_data['zp'] = hash('sha256', trim($user_data['zip']));
    }
    
    // Include IP and user agent (Meta Pixel requires this for location detection)
    $meta_user_data['client_ip_address'] = get_real_client_ip();
    $meta_user_data['client_user_agent'] = sanitize_text_field($_SERVER['HTTP_USER_AGENT'] ?? '');
    
    return $meta_user_data;
}

/**
 * Send event to Meta Pixel server
 */
function send_meta_pixel_event($event_data, $pixel_id, $access_token) {
    // Meta Pixel server-side API endpoint
    $api_url = "https://graph.facebook.com/v18.0/{$pixel_id}/events?access_token={$access_token}";
    
    // Prepare the payload
    $payload = array(
        'data' => $event_data
    );
    
    // Send the request to Meta
    $response = wp_remote_post($api_url, array(
        'method' => 'POST',
        'timeout' => 30,
        'headers' => array(
            'Content-Type' => 'application/json',
        ),
        'body' => json_encode($payload),
        'data_format' => 'body',
    ));
    
    // Check for errors in the request
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
    
    // Check if the API returned an error
    if (isset($response_data['error'])) {
        $error_message = "Meta Pixel API Error: " . $response_data['error']['message'];
        error_log($error_message);
        return new WP_Error('meta_pixel_api_error', $error_message, array('status' => $response_code));
    }
    
    return $response_data;
}

/**
 * Get real client IP address (respecting proxy headers)
 */
function get_real_client_ip() {
    $ip_keys = array('HTTP_CF_CONNECTING_IP', 'HTTP_CLIENT_IP', 'HTTP_X_FORWARDED_FOR', 'HTTP_X_FORWARDED', 'HTTP_X_CLUSTER_CLIENT_IP', 'HTTP_FORWARDED_FOR', 'HTTP_FORWARDED', 'REMOTE_ADDR');
    
    foreach ($ip_keys as $key) {
        if (array_key_exists($key, $_SERVER) === true) {
            foreach (array_map('trim', explode(',', $_SERVER[$key])) as $ip) {
                if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) !== false) {
                    return $ip;
                }
            }
        }
    }
    
    return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
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

/**
 * Display the settings page HTML
 */
function meta_pixel_settings_page_html() {
    // Check user capabilities
    if (!current_user_can('manage_options')) {
        return;
    }

    // Check if form was submitted
    if (isset($_POST['submit'])) {
        // Sanitize and save the field
        $pixel_id = sanitize_text_field($_POST['meta_pixel_id']);
        $access_token = sanitize_text_field($_POST['meta_pixel_access_token']);
        
        update_option('meta_pixel_id', $pixel_id);
        update_option('meta_pixel_access_token', $access_token);
        
        // Show a success message
        echo '<div class="notice notice-success"><p>Settings saved successfully!</p></div>';
    }

    // Get saved values
    $pixel_id = get_option('meta_pixel_id', '');
    $access_token = get_option('meta_pixel_access_token', '');
    ?>
    
    <div class="wrap">
        <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
        
        <form method="post" action="">
            <table class="form-table" role="presentation">
                <tbody>
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
                </tbody>
            </table>
            
            <?php submit_button('Save Settings', 'primary', 'submit'); ?>
        </form>
        
        <div class="card" style="margin-top: 20px;">
            <h2>How to Get Your Meta Pixel ID and Access Token</h2>
            <ol>
                <li>Go to <a href="https://www.facebook.com/events_manager2/" target="_blank">Meta Events Manager</a></li>
                <li>Find or create your Pixel</li>
                <li>Copy the Pixel ID (e.g., "123456789012345")</li>
                <li>Go to <a href="https://developers.facebook.com/" target="_blank">Meta for Developers</a></li>
                <li>Create an app or use an existing one</li>
                <li>In your app, go to Tools → Access Token Tool</li>
                <li>Create an access token with "business_management" and "ads_management" permissions</li>
            </ol>
        </div>
    </div>
    <?php
}

/**
 * Example: Hook into WooCommerce purchase events for automatic tracking
 */
add_action('woocommerce_thankyou', 'track_woocommerce_purchase_server_side');
function track_woocommerce_purchase_server_side($order_id) {
    if (!$order_id) {
        return;
    }
    
    // Get the order object
    $order = wc_get_order($order_id);
    
    if (!$order) {
        return;
    }
    
    // Prepare user data from the order
    $user_data = array(
        'email' => $order->get_billing_email(),
        'first_name' => $order->get_billing_first_name(),
        'last_name' => $order->get_billing_last_name(),
        'city' => $order->get_billing_city(),
        'state' => $order->get_billing_state(),
        'country' => $order->get_billing_country(),
        'zip' => $order->get_billing_postcode(),
    );
    
    // Prepare contents data
    $contents = array();
    foreach ($order->get_items() as $item) {
        $product = $item->get_product();
        $contents[] = array(
            'id' => $product->get_id(),
            'quantity' => $item->get_quantity(),
            'item_price' => $item->get_subtotal() / $item->get_quantity(),
        );
    }
    
    // Prepare the purchase event data
    $event_data = prepare_meta_pixel_purchase_event(
        $order_id,
        $order->get_currency(),
        $order->get_total(),
        $contents,
        $user_data
    );
    
    // Get Meta Pixel credentials
    $pixel_id = get_option('meta_pixel_id', '');
    $access_token = get_option('meta_pixel_access_token', '');
    
    if (empty($pixel_id) || empty($access_token)) {
        $pixel_id = defined('META_PIXEL_ID') ? META_PIXEL_ID : '';
        $access_token = defined('META_PIXEL_ACCESS_TOKEN') ? META_PIXEL_ACCESS_TOKEN : '';
    }
    
    if (!empty($pixel_id) && !empty($access_token)) {
        // Send the purchase event to Meta Pixel server
        send_meta_pixel_event($event_data, $pixel_id, $access_token);
    }
}

/**
 * Enable CORS for the Meta Pixel endpoints so they can be called from React app
 */
add_action('rest_api_init', function () {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function ($value) {
        header('Access-Control-Allow-Origin: ' . get_site_url());
        header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Headers: X-Requested-With, Content-Type, Accept, Origin, Authorization');
        return $value;
    });
}, 15);

// Handle preflight OPTIONS requests
add_action('init', function() {
    if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD'])) {
            header('Access-Control-Allow-Origin: ' . get_site_url());
            header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
            header('Access-Control-Allow-Credentials: true');
            header('Access-Control-Allow-Headers: X-Requested-With, Content-Type, Accept, Origin, Authorization');
        }
        if (strpos($_SERVER['REQUEST_URI'], '/wp-json/meta-pixel/') !== false) {
            exit;
        }
    }
});
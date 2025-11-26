<?php
/**
 * Plugin Name: Meta Pixel Custom
 * Description: Provide server-side Meta Pixel support
 * Version: 1.0
 */

/**
 * Simple Server-Side Meta Pixel Tracking for WordPress
 * 
 * @package Simple-Meta-Pixel-Server-Side
 * @version 1.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Add server-side Meta Pixel tracking endpoints
 */
add_action('rest_api_init', 'simple_meta_pixel_register_routes');

function simple_meta_pixel_register_routes() {
    register_rest_route('meta-pixel/v1', '/track', array(
        'methods' => 'POST',
        'callback' => 'simple_track_meta_pixel_event',
        'permission_callback' => '__return_true',
    ));

    register_rest_route('meta-pixel/v1', '/purchase', array(
        'methods' => 'POST',
        'callback' => 'simple_track_meta_pixel_purchase',
        'permission_callback' => '__return_true',
    ));
}

/**
 * Track Meta Pixel events server-side
 */
function simple_track_meta_pixel_event($request) {
    $event_name = sanitize_text_field($request->get_param('event_name'));
    $event_id = sanitize_text_field($request->get_param('event_id'));
    $user_data = $request->get_param('user_data');
    $custom_data = $request->get_param('custom_data');
    $test_event_code = sanitize_text_field($request->get_param('test_event_code'));

    if (empty($event_name)) {
        return new WP_Error('missing_event_name', 'Event name is required', array('status' => 400));
    }

    // Get Meta Pixel credentials from options
    $pixel_id = get_option('meta_pixel_id', '');
    $access_token = get_option('meta_pixel_access_token', '');

    if (empty($pixel_id) || empty($access_token)) {
        return new WP_Error('missing_credentials', 'Meta Pixel ID and Access Token are required', array('status' => 400));
    }

    $event_data = simple_prepare_meta_pixel_event(
        $event_name,
        $event_id ?: simple_generate_event_id(),
        $user_data,
        $custom_data
    );

    $response = simple_send_meta_pixel_event($event_data, $pixel_id, $access_token, $test_event_code);

    if (is_wp_error($response)) {
        return $response;
    }

    error_log("Simple Meta Pixel Event Tracked: " . $event_name);

    return array(
        'success' => true,
        'event_name' => $event_name,
        'response' => $response
    );
}

/**
 * Track purchase events server-side
 */
function simple_track_meta_pixel_purchase($request) {
    $order_id = sanitize_text_field($request->get_param('order_id'));
    $currency = sanitize_text_field($request->get_param('currency')) ?: 'USD';
    $value = floatval($request->get_param('value'));
    $contents = $request->get_param('contents');
    $user_data = $request->get_param('user_data');
    $test_event_code = sanitize_text_field($request->get_param('test_event_code'));

    if (empty($order_id) || empty($value) || empty($contents)) {
        return new WP_Error('missing_required_fields', 'Order ID, value, and contents are required', array('status' => 400));
    }

    $pixel_id = get_option('meta_pixel_id', '');
    $access_token = get_option('meta_pixel_access_token', '');

    if (empty($pixel_id) || empty($access_token)) {
        return new WP_Error('missing_credentials', 'Meta Pixel ID and Access Token are required', array('status' => 400));
    }

    $event_data = simple_prepare_meta_pixel_purchase_event(
        $order_id,
        $currency,
        $value,
        $contents,
        $user_data
    );

    $response = simple_send_meta_pixel_event($event_data, $pixel_id, $access_token, $test_event_code);

    if (is_wp_error($response)) {
        return $response;
    }

    error_log("Simple Meta Pixel Purchase Tracked: Order #{$order_id}");

    return array(
        'success' => true,
        'order_id' => $order_id,
        'response' => $response
    );
}

/**
 * Prepare event data for Meta Pixel
 */
function simple_prepare_meta_pixel_event($event_name, $event_id, $user_data, $custom_data) {
    return array(
        array(
            'event_name' => $event_name,
            'event_time' => time(),
            'event_id' => $event_id,
            'action_source' => 'website',
            'event_source_url' => esc_url_raw(home_url($_SERVER['REQUEST_URI'] ?? '')),
            'user_data' => simple_prepare_meta_user_data($user_data),
            'custom_data' => $custom_data ?: array(),
        )
    );
}

/**
 * Prepare purchase event data for Meta Pixel
 */
function simple_prepare_meta_pixel_purchase_event($order_id, $currency, $value, $contents, $user_data) {
    return array(
        array(
            'event_name' => 'Purchase',
            'event_time' => time(),
            'event_id' => simple_generate_event_id(),
            'action_source' => 'website',
            'event_source_url' => esc_url_raw(home_url($_SERVER['REQUEST_URI'] ?? '')),
            'user_data' => simple_prepare_meta_user_data($user_data),
            'custom_data' => array(
                'currency' => $currency,
                'value' => $value,
                'contents' => $contents,
                'order_id' => $order_id,
            ),
        )
    );
}

/**
 * Prepare user data for Meta Pixel (with privacy considerations)
 */
function simple_prepare_meta_user_data($user_data) {
    $meta_user_data = array();
    
    if (is_array($user_data)) {
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

    // Include IP and user agent
    $meta_user_data['client_ip_address'] = simple_get_real_client_ip();
    $meta_user_data['client_user_agent'] = sanitize_text_field($_SERVER['HTTP_USER_AGENT'] ?? '');

    return $meta_user_data;
}

/**
 * Send event to Meta Pixel server
 */
function simple_send_meta_pixel_event($event_data, $pixel_id, $access_token, $test_event_code = null) {
    // Meta Pixel server-side API endpoint
    $api_url = "https://graph.facebook.com/v18.0/{$pixel_id}/events?access_token={$access_token}";
    
    // Add test event code to URL if provided
    if ($test_event_code) {
        $api_url .= '&test_event_code=' . urlencode($test_event_code);
    }

    // Prepare the request body
    $body = array(
        'data' => $event_data,
    );

    $response = wp_remote_post($api_url, array(
        'headers' => array(
            'Content-Type' => 'application/json',
        ),
        'body' => wp_json_encode($body),
        'timeout' => 30,
    ));

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
function simple_get_real_client_ip() {
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
function simple_generate_event_id() {
    return 'event_' . uniqid() . '_' . time();
}

/**
 * Enable CORS for the Meta Pixel endpoints
 */
add_action('rest_api_init', 'simple_enable_cors_for_meta_pixel');

function simple_enable_cors_for_meta_pixel() {
    add_filter('rest_pre_serve_request', function ($served, $result, $request, $server) {
        if (strpos($request->get_route(), '/wp-json/meta-pixel/') !== false) {
            header('Access-Control-Allow-Origin: *');
            header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
            header('Access-Control-Allow-Headers: Content-Type, Authorization');
        }
        return $served;
    }, 10, 4);
}

// Handle preflight OPTIONS requests
add_action('init', 'simple_handle_cors_preflight');

function simple_handle_cors_preflight() {
    if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS' && 
        isset($_SERVER['REQUEST_URI']) && strpos($_SERVER['REQUEST_URI'], 'wp-json/meta-pixel/') !== false) {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        exit(0);
    }
}
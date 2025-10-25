# WordPress OTP Authentication Plugin

This document provides instructions for implementing OTP (One-Time Password) authentication in WordPress that works with the React frontend.

## Overview

The React frontend expects two custom REST API endpoints for OTP authentication:

1. `/wp-json/otp/v1/send` - Sends an OTP to the user's email
2. `/wp-json/otp/v1/verify` - Verifies the OTP and returns a JWT token

## WordPress Implementation

Add the following code to your WordPress theme's `functions.php` file or create a custom plugin:

```php
<?php
// Add these functions to your theme's functions.php file or create a custom plugin

// Hook to initialize our custom endpoints
add_action('rest_api_init', function () {
    // Endpoint to send OTP
    register_rest_route('otp/v1', '/send', array(
        'methods' => 'POST',
        'callback' => 'send_otp',
        'permission_callback' => '__return_true',
    ));

    // Endpoint to verify OTP
    register_rest_route('otp/v1', '/verify', array(
        'methods' => 'POST',
        'callback' => 'verify_otp',
        'permission_callback' => '__return_true',
    ));
});

// Function to generate a random OTP
function generate_otp() {
    return rand(100000, 999999); // 6-digit OTP
}

// Function to store OTP temporarily (you might want to use a more secure storage method)
function store_otp($email, $otp, $expires_in = 300) { // 5 minutes default expiry
    $otp_key = 'otp_' . md5($email);
    $otp_data = array(
        'otp' => $otp,
        'expires' => time() + $expires_in,
        'email' => $email
    );
    set_transient($otp_key, $otp_data, $expires_in);
}

// Function to retrieve stored OTP
function retrieve_otp($email) {
    $otp_key = 'otp_' . md5($email);
    return get_transient($otp_key);
}

// Function to delete OTP after use
function delete_otp($email) {
    $otp_key = 'otp_' . md5($email);
    delete_transient($otp_key);
}

// Function to send OTP
function send_otp($request) {
    $params = $request->get_params();
    $email = sanitize_email($params['email']);

    // Validate email
    if (empty($email) || !is_email($email)) {
        return new WP_Error('invalid_email', 'Please provide a valid email address', array('status' => 400));
    }

    // Generate OTP
    $otp = generate_otp();

    // Store OTP temporarily
    store_otp($email, $otp);

    // Send OTP via email
    $subject = 'Your OTP for MyWishCare';
    $message = "Your one-time password (OTP) for MyWishCare is: {$otp}\n\nThis OTP is valid for 5 minutes.";
    $headers = array('Content-Type: text/html; charset=UTF-8');

    $sent = wp_mail($email, $subject, $message, $headers);

    if ($sent) {
        return array(
            'success' => true,
            'message' => 'OTP sent successfully to your email'
        );
    } else {
        // If email sending fails, return error
        return new WP_Error('email_failed', 'Failed to send OTP email', array('status' => 500));
    }
}

// Function to verify OTP and return JWT token
function verify_otp($request) {
    $params = $request->get_params();
    $email = sanitize_email($params['email']);
    $provided_otp = sanitize_text_field($params['otp']);

    // Validate input
    if (empty($email) || empty($provided_otp)) {
        return new WP_Error('missing_fields', 'Email and OTP are required', array('status' => 400));
    }

    // Retrieve stored OTP
    $stored_otp_data = retrieve_otp($email);

    if (!$stored_otp_data) {
        return new WP_Error('otp_not_found', 'Invalid or expired OTP', array('status' => 400));
    }

    // Check if OTP has expired
    if (time() > $stored_otp_data['expires']) {
        delete_otp($email); // Clean up expired OTP
        return new WP_Error('otp_expired', 'OTP has expired, please request a new one', array('status' => 400));
    }

    // Verify OTP
    if ($provided_otp != $stored_otp_data['otp']) {
        return new WP_Error('invalid_otp', 'Invalid OTP provided', array('status' => 400));
    }

    // OTP is valid, clean it up
    delete_otp($email);

    // Check if user exists, if not create one
    $user = get_user_by('email', $email);
    
    if (!$user) {
        // Generate a random password for the new user
        $random_password = wp_generate_password();
        
        // Create new user with email as username
        $user_id = wp_create_user($email, $random_password, $email);
        
        if (is_wp_error($user_id)) {
            return $user_id; // Return WP_Error if creation fails
        }
        
        // Update display name to match email (or you could ask for name in the frontend)
        wp_update_user(array(
            'ID' => $user_id,
            'display_name' => $email,
            'first_name' => explode('@', $email)[0] // Use part before @ as first name
        ));
        
        $user = get_user_by('id', $user_id);
    }

    // Generate JWT token using JWT Authentication for WP REST API plugin
    if (class_exists('JWT_Auth_Public')) {
        // Using username and password to get JWT token
        $authenticator = new JWT_Auth_Public();
        
        // Attempt to get token using the user's credentials
        $result = wp_signon(array(
            'user_login' => $user->user_login,
            'user_password' => $user->user_pass, // This won't work directly; we need to use existing JWT functions
        ), false);

        if (is_wp_error($result)) {
            return $result;
        }

        // Use JWT Authentication plugin to generate token
        $credentials = array(
            'username' => $user->user_login,
            'password' => $user->user_pass // In reality, you'd need to handle this differently
        );
        
        // Unfortunately, we can't directly call the token endpoint from within PHP
        // So we'll manually generate JWT using the same method as the JWT plugin
        $issued_at = time();
        $expiration_time = apply_filters('jwt_auth_token_expiration', $issued_at + (15 * 60), $user); // 15 minutes default
        $token = array(
            'iss' => get_bloginfo('url'),
            'iat' => $issued_at,
            'nbf' => $issued_at,
            'exp' => $expiration_time,
            'data' => array(
                'user' => array(
                    'id' => $user->ID,
                ),
            ),
        );

        $jwt = JWT::encode($token, JWT_AUTH_SECRET_KEY, 'HS256');

        // Get user data to return
        $user_data = array(
            'id' => $user->ID,
            'username' => $user->user_login,
            'email' => $user->user_email,
            'name' => $user->display_name,
            'roles' => $user->roles
        );

        return array(
            'token' => $jwt,
            'user' => $user_data,
            'expires_in' => $expiration_time - $issued_at
        );
    } else {
        // JWT Authentication plugin not active
        return new WP_Error('jwt_not_active', 'JWT Authentication plugin is not active', array('status' => 500));
    }
}
```

## Better Implementation with Proper JWT Generation

The above code has an issue with JWT generation. Here's a corrected version that properly integrates with JWT Authentication for WP REST API:

```php
<?php
// More complete JWT implementation
function verify_otp($request) {
    $params = $request->get_params();
    $email = sanitize_email($params['email']);
    $provided_otp = sanitize_text_field($params['otp']);

    // Validate input
    if (empty($email) || empty($provided_otp)) {
        return new WP_Error('missing_fields', 'Email and OTP are required', array('status' => 400));
    }

    // Retrieve stored OTP
    $stored_otp_data = retrieve_otp($email);

    if (!$stored_otp_data) {
        return new WP_Error('otp_not_found', 'Invalid or expired OTP', array('status' => 400));
    }

    // Check if OTP has expired
    if (time() > $stored_otp_data['expires']) {
        delete_otp($email); // Clean up expired OTP
        return new WP_Error('otp_expired', 'OTP has expired, please request a new one', array('status' => 400));
    }

    // Verify OTP
    if ($provided_otp != $stored_otp_data['otp']) {
        return new WP_Error('invalid_otp', 'Invalid OTP provided', array('status' => 400));
    }

    // OTP is valid, clean it up
    delete_otp($email);

    // Check if user exists, if not create one
    $user = get_user_by('email', $email);
    
    if (!$user) {
        // Generate a random password for the new user
        $random_password = wp_generate_password();
        
        // Create new user with email as username
        $user_id = wp_create_user($email, $random_password, $email);
        
        if (is_wp_error($user_id)) {
            return $user_id; // Return WP_Error if creation fails
        }
        
        // Update display name to match email (or you could ask for name in the frontend)
        wp_update_user(array(
            'ID' => $user_id,
            'display_name' => $email,
            'first_name' => explode('@', $email)[0] // Use part before @ as first name
        ));
        
        $user = get_user_by('id', $user_id);
    }

    // Now we need to generate JWT token
    // First check if JWT Authentication plugin is active
    if (!defined('JWT_AUTH_SECRET_KEY') || !class_exists('JWT_Auth_Public')) {
        return new WP_Error('jwt_not_configured', 'JWT Authentication is not properly configured', array('status' => 500));
    }

    // Create a custom function to generate the JWT token
    // This mimics the functionality of the JWT Authentication plugin
    $issued_at = time();
    $not_before_claim = $issued_at; // Token can be used immediately
    $expire = $issued_at + (12 * 60 * 60); // Token expires in 12 hours

    $token = array(
        'iss' => get_bloginfo('url'), // Issuer
        'iat' => $issued_at,          // Issued at
        'nbf' => $not_before_claim,   // Not before
        'exp' => $expire,             // Expire
        'data' => array(
            'user' => array(
                'id' => $user->ID,
            ),
        ),
    );

    // Encode the token
    if (!class_exists('Firebase\JWT\JWT')) {
        // Try to load the JWT class from JWT plugin if not already loaded
        if (file_exists(WP_PLUGIN_DIR . '/jwt-authentication-for-wp-rest-api/vendor/autoload.php')) {
            require_once WP_PLUGIN_DIR . '/jwt-authentication-for-wp-rest-api/vendor/autoload.php';
        }
    }

    try {
        if (class_exists('Firebase\JWT\JWT')) {
            $jwt = Firebase\JWT\JWT::encode($token, JWT_AUTH_SECRET_KEY, 'HS256');
        } else {
            $jwt = JWT::encode($token, JWT_AUTH_SECRET_KEY, 'HS256');
        }
    } catch (Exception $e) {
        return new WP_Error('jwt_encoding_error', 'Error encoding JWT: ' . $e->getMessage(), array('status' => 500));
    }

    // Get user data to return
    $user_data = array(
        'id' => $user->ID,
        'username' => $user->user_login,
        'email' => $user->user_email,
        'name' => $user->display_name,
        'roles' => $user->roles
    );

    return array(
        'token' => $jwt,
        'user' => $user_data,
        'expires_in' => $expire - $issued_at
    );
}
```

## Installation

1. Add the above code to your WordPress theme's `functions.php` file
2. Make sure you have the JWT Authentication for WP REST API plugin installed and activated
3. Ensure the JWT secret key is properly configured in your `wp-config.php` file
4. Test the endpoints by sending POST requests to:
   - `https://your-wordpress-site.com/wp-json/otp/v1/send`
   - `https://your-wordpress-site.com/wp-json/otp/v1/verify`

## Security Considerations

1. **Rate Limiting**: Implement rate limiting to prevent OTP spam
2. **OTP Expiry**: Ensure OTPs expire after a short time (e.g., 5 minutes)
3. **Secure Storage**: Consider using a more secure temporary storage method than WordPress transients for OTPs
4. **Email Security**: Ensure emails are sent securely using verified email services
5. **Validation**: Always validate input data to prevent injection attacks

## Fallback Implementation

If you're unable to implement the custom WordPress plugin immediately, the React app includes a fallback mechanism that uses the existing username/password authentication flow with a temporary password approach.
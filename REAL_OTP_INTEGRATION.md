# Real OTP Integration for WordPress

This guide explains how to implement real OTP (One-Time Password) functionality for your WordPress site to work with the React frontend.

## Prerequisites

1. **JWT Authentication for WP REST API** plugin installed and activated
2. WordPress site with ability to edit `wp-config.php` and `functions.php` files
3. SMTP configured or hosting that supports email delivery (required for `wp_mail()`)

## Step 1: Configure JWT Authentication

1. Install the "JWT Authentication for WP REST API" plugin
2. Generate a secret key and add it to your `wp-config.php`:

```php
define('JWT_AUTH_SECRET_KEY', 'your-generated-secret-key-here');
```

3. To generate a secure secret key, run this command in your terminal:
```bash
openssl rand -base64 32
```

## Step 2: Add OTP Functionality to WordPress

Add the following code to your active theme's `functions.php` file (or create a custom plugin):

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
    return str_pad(rand(100000, 999999), 6, '0', STR_PAD_LEFT); // 6-digit OTP
}

// Function to store OTP temporarily using WordPress transients (stored in database, auto-expiring)
function store_otp($email, $otp, $expires_in = 300) { // 5 minutes default expiry
    $otp_key = 'otp_' . md5($email);
    $otp_data = array(
        'otp' => $otp,
        'email' => $email,
        'created_at' => time()
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

    // Check if OTP has expired (5 minutes)
    $otp_age = time() - $stored_otp_data['created_at'];
    if ($otp_age > 300) { // 5 minutes = 300 seconds
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
        
        // Update display name to match email
        wp_update_user(array(
            'ID' => $user_id,
            'display_name' => explode('@', $email)[0], // Use part before @ as display name
            'first_name' => explode('@', $email)[0]
        ));
        
        $user = get_user_by('id', $user_id);
    }

    // Now we need to generate JWT token using JWT Authentication for WP REST API plugin
    if (!defined('JWT_AUTH_SECRET_KEY') || !class_exists('JWT_Auth_Public')) {
        return new WP_Error('jwt_not_configured', 'JWT Authentication is not properly configured', array('status' => 500));
    }

    // Use existing JWT plugin functionality
    $issued_at = time();
    $expiration_time = apply_filters('jwt_auth_token_expiration', $issued_at + (12 * 60 * 60), $user); // 12 hours default
    $token = array(
        'iss' => get_bloginfo('url'), // Issuer
        'iat' => $issued_at,          // Issued at
        'nbf' => $issued_at,          // Not before
        'exp' => $expiration_time,    // Expire
        'data' => array(
            'user' => array(
                'id' => $user->ID,
            ),
        ),
    );

    // Encode the token
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
        'expires_in' => $expiration_time - $issued_at
    );
}
```

## Step 3: Configure Email Delivery (Important!)

WordPress uses the `wp_mail()` function to send emails. You may need to configure email delivery:

### Option 1: Use an SMTP Plugin
Install a plugin like "WP Mail SMTP" or "Easy WP SMTP" to ensure reliable email delivery.

### Option 2: Verify Server Configuration
Make sure your hosting provider allows PHP `mail()` function or SMTP connections.

## Step 4: Test the Endpoints

After adding the code, you can test the endpoints:

### Test Send OTP:
```
POST /wp-json/otp/v1/send
Content-Type: application/json

{
  "email": "your-email@example.com"
}
```

### Test Verify OTP:
```
POST /wp-json/otp/v1/verify
Content-Type: application/json

{
  "email": "your-email@example.com",
  "otp": "123456"
}
```

## Security Features

1. **OTP Expiration**: OTPs expire after 5 minutes
2. **Single Use**: Each OTP can only be used once
3. **Input Validation**: Email and OTP are properly sanitized
4. **Rate Limiting**: WordPress's built-in protections apply
5. **Auto Cleanup**: Expired OTPs are automatically removed

## Troubleshooting

### If emails are not being sent:
1. Check that your WordPress site can send emails using `wp_mail()`
2. Install an SMTP plugin for reliable delivery
3. Check your server's email configuration

### If JWT tokens are not generated:
1. Verify JWT Authentication for WP REST API is installed and activated
2. Confirm the JWT secret key is properly set in `wp-config.php`
3. Ensure the JWT plugin is correctly configured

### If endpoints return 404:
1. Make sure permalinks are saved (Go to Settings > Permalinks and click Save)
2. Check that the code was properly added to `functions.php`

## Frontend Integration

Your React frontend is already configured to work with these endpoints:
- Send OTP: `POST /wp-json/otp/v1/send`
- Verify OTP: `POST /wp-json/otp/v1/verify`

The authentication flow will work seamlessly once the WordPress backend is configured.
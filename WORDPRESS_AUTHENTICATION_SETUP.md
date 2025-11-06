# WordPress Authentication Setup Guide

This guide will help you set up WordPress authentication for your React application, including JWT authentication and custom user registration.

## Prerequisites

- Access to your WordPress admin dashboard
- Ability to edit your `wp-config.php` file
- Ability to edit your theme's `functions.php` file
- Your React application with the updated authentication code

## Step 1: Install JWT Authentication Plugin

1. Log into your WordPress admin dashboard
2. Go to `Plugins` → `Add New`
3. In the search box, type "JWT Authentication for WP REST API"
4. Find the plugin by "RESSOURCEPACK" (the most popular one)
5. Click `Install Now`, then `Activate`

## Step 2: Configure JWT Secret Key

1. **Generate a secret key**:
   - Open a terminal/command prompt
   - Run: `openssl rand -base64 32`
   - Or use an online random string generator to create a random string of at least 32 characters

2. **Add the secret key to your WordPress configuration**:
   - Access your `wp-config.php` file via FTP/File Manager or your hosting control panel
   - Add this line before the `/* That's all, stop editing! */` line:
   ```php
   define('JWT_AUTH_SECRET_KEY', 'your-generated-secret-key-here');
   ```
   - Replace `your-generated-secret-key-here` with the key you generated in step 1
   - Save the file

## Step 3: Configure Plugin Settings

1. After activating the plugin, check if there are settings at `Settings` → `JWT Authentication` (location may vary by theme)
2. Ensure the plugin is enabled
3. Save the settings if there are any options to configure

## Step 4: Enable WordPress User Registration

1. Go to `Settings` → `General`
2. Check the "Anyone can register" option
3. Select a default role for new users (e.g., Subscriber)
4. Save the settings

## Step 5: Add Custom Registration Endpoint

1. **Access your theme's functions.php file**:
   - Log into your WordPress admin
   - Go to `Appearance` → `Theme Editor`
   - Select "Theme Functions" (`functions.php`) from the right sidebar
   - OR if you're using a child theme (recommended), edit that instead

2. **Add the following code to the bottom of your `functions.php` file**:
```php
// Custom registration endpoint for React app
add_action('rest_api_init', function () {
    register_rest_route('custom/v1', '/register', array(
        'methods' => 'POST',
        'callback' => 'custom_user_registration',
        'permission_callback' => '__return_true', // Allow registration from any source
    ));
});

function custom_user_registration($request) {
    $params = $request->get_params();
    
    $username = sanitize_user($params['username']);
    $email = sanitize_email($params['email']);
    $password = $params['password'];
    $display_name = sanitize_text_field($params['display_name'] ?? $username);
    
    // Validate input
    if (empty($username) || empty($email) || empty($password)) {
        return new WP_Error('missing_fields', 'Required fields are missing', array('status' => 400));
    }
    
    // Check if user already exists
    if (username_exists($username)) {
        return new WP_Error('username_exists', 'Username already exists', array('status' => 400));
    }
    
    if (email_exists($email)) {
        return new WP_Error('email_exists', 'Email already exists', array('status' => 400));
    }
    
    // Create the user
    $user_id = wp_create_user($username, $password, $email);
    
    if (is_wp_error($user_id)) {
        return $user_id; // Return WP_Error object if creation fails
    }
    
    // Update display name
    wp_update_user(array(
        'ID' => $user_id,
        'display_name' => $display_name
    ));
    
    // Get user data to return
    $user = get_user_by('id', $user_id);
    
    // Return user data
    return array(
        'id' => $user->ID,
        'username' => $user->user_login,
        'email' => $user->user_email,
        'name' => $user->display_name,
        'roles' => $user->roles
    );
}
```

3. **Save your changes** to the `functions.php` file

## Step 6: Add OTP Authentication Endpoints

1. **Add the following code to the bottom of your `functions.php` file** (after the registration code):
```php
// OTP Authentication endpoints for React app
add_action('rest_api_init', function () {
    // Endpoint to send OTP
    register_rest_route('otp/v1', '/send', array(
        'methods' => 'POST',
        'callback' => 'send_otp_endpoint',
        'permission_callback' => '__return_true',
    ));
    
    // Endpoint to verify OTP
    register_rest_route('otp/v1', '/verify', array(
        'methods' => 'POST',
        'callback' => 'verify_otp_endpoint',
        'permission_callback' => '__return_true',
    ));
});

// Function to generate a random 6-digit OTP
function generate_otp() {
    return str_pad(rand(100000, 999999), 6, '0', STR_PAD_LEFT);
}

// Function to store OTP temporarily using WordPress transients
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

// Endpoint to send OTP
function send_otp_endpoint($request) {
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
    $headers = array('Content-Type: text/plain; charset=UTF-8');
    
    $sent = wp_mail($email, $subject, $message, $headers);
    
    if ($sent) {
        return array(
            'success' => true,
            'message' => 'OTP sent successfully to your email'
        );
    } else {
        return new WP_Error('email_failed', 'Failed to send OTP email', array('status' => 500));
    }
}

// Endpoint to verify OTP and authenticate user
function verify_otp_endpoint($request) {
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
    
    // Generate JWT token using JWT Authentication for WP REST API plugin
    if (!defined('JWT_AUTH_SECRET_KEY') || !class_exists('JWT_Auth_Public')) {
        return new WP_Error('jwt_not_configured', 'JWT Authentication is not properly configured', array('status' => 500));
    }
    
    // Use existing JWT plugin functionality to generate token
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

4. **Save your changes** to the `functions.php` file

## Step 6: Configure Server Settings (if needed)

### For Apache servers:
1. Add these lines to your `.htaccess` file in the WordPress root directory:
```
RewriteEngine on
RewriteCond %{HTTP:Authorization} ^(.*)
RewriteRule .* - [e=HTTP_AUTHORIZATION:%1]
```

### For Nginx servers:
1. Add this to your server configuration:
```
fastcgi_param HTTP_AUTHORIZATION $http_authorization;
```

## Step 7: Update Your React App Environment Variables

Make sure your React app's `.env` file has the correct API URL:
```env
VITE_WP_API_URL=https://wishcarebd.com/wp-json
```

## Step 8: Testing Your Setup

### Testing JWT Login Endpoint
Use a REST API client like Postman or curl:
```bash
curl -X POST https://wishcarebd.com/wp-json/jwt-auth/v1/token \
  -H "Content-Type: application/json" \
  -d '{
    "username": "your-username",
    "password": "your-password"
  }'
```
You should get a response with a JWT token, user info, and expiration time if successful.

### Testing Registration Endpoint
```bash
curl -X POST https://wishcarebd.com/wp-json/custom/v1/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "testpassword",
    "display_name": "Test User"
  }'
```

## Troubleshooting

### Common Issues and Solutions

#### 404 Error on JWT Endpoint
- The JWT plugin isn't activated
- The secret key isn't properly configured in wp-config.php

#### 401 Error
- Incorrect login credentials
- The JWT token is expired or invalid

#### Registration Not Working
- The code was not properly added to functions.php
- "Anyone can register" is not enabled in WordPress settings
- Server configuration doesn't allow Authorization headers (check .htaccess changes)

#### API Requests Failing
- Check that your React app is using the correct API URL format
- Verify that CORS settings allow requests from your React app domain

## Security Considerations

- Keep your JWT secret key secure and don't expose it in client-side code
- Consider implementing rate limiting for authentication endpoints
- Regularly update the JWT Authentication plugin as security updates are released
- Use HTTPS for all authentication requests

## Additional Resources

- [WordPress REST API Documentation](https://developer.wordpress.org/rest-api/)
- [JWT Authentication Plugin on WordPress.org](https://wordpress.org/plugins/jwt-authentication-for-wp-rest-api/)
- [WordPress Application Passwords](https://make.wordpress.org/core/2020/11/05/application-passwords-integration-guide/)
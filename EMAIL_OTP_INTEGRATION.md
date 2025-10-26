# Email OTP Integration Guide for WordPress + WooCommerce + React

## Overview
This guide provides instructions for implementing email OTP authentication in a custom React UI while maintaining integration with WordPress/WooCommerce backend.

## Architecture

### Frontend (React)
- Custom UI components for email input, OTP sending, and verification
- API calls to WordPress backend
- State management for OTP flow

### Backend (WordPress/WooCommerce)
- Custom plugin to handle OTP generation and validation
- REST API endpoints for communication
- Integration with WordPress user system

## Implementation Steps

### 1. Create Custom WordPress Plugin

1. Create a new folder in `/wp-content/plugins/`:
   ```
   /wp-content/plugins/custom-otp-auth/
   ```

2. Create the main plugin file `custom-otp-auth.php`:
   ```php
   <?php
   /**
    * Plugin Name: Custom OTP Authentication
    * Description: Provides email OTP functionality for custom React UI
    * Version: 1.0
    */

   if (!defined('ABSPATH')) {
       exit;
   }

   class CustomOTPAuth {
       
       public function __construct() {
           add_action('rest_api_init', array($this, 'register_routes'));
       }
       
       public function register_routes() {
           register_rest_route('custom/v1', '/otp/request', array(
               'methods' => 'POST',
               'callback' => array($this, 'request_otp'),
               'permission_callback' => '__return_true',
           ));
           
           register_rest_route('custom/v1', '/otp/verify', array(
               'methods' => 'POST',
               'callback' => array($this, 'verify_otp'),
               'permission_callback' => '__return_true',
           ));
       }
       
       public function request_otp($request) {
           $email = sanitize_email($request->get_param('email'));
           
           if (!is_email($email)) {
               return new WP_REST_Response(array(
                   'success' => false,
                   'message' => 'Invalid email address'
               ), 400);
           }
           
           // Generate random 6-digit OTP
           $otp = rand(100000, 999999);
           
           // Store OTP temporarily (valid for 5 minutes)
           $expiry = time() + (5 * 60); // 5 minutes
           update_option("otp_{$email}", array(
               'code' => $otp,
               'expiry' => $expiry
           ));
           
           // Send email with OTP
           $subject = 'Your OTP Code';
           $message = "Your OTP code is: {$otp}\n\nThis code will expire in 5 minutes.";
           
           $mail_sent = wp_mail($email, $subject, $message);
           
           if ($mail_sent) {
               return new WP_REST_Response(array(
                   'success' => true,
                   'message' => 'OTP sent successfully'
               ), 200);
           } else {
               return new WP_REST_Response(array(
                   'success' => false,
                   'message' => 'Failed to send OTP'
               ), 500);
           }
       }
       
       public function verify_otp($request) {
           $email = sanitize_email($request->get_param('email'));
           $otp = $request->get_param('otp');
           
           if (!is_email($email) || empty($otp)) {
               return new WP_REST_Response(array(
                   'success' => false,
                   'message' => 'Email and OTP are required'
               ), 400);
           }
           
           // Retrieve stored OTP
           $stored_otp = get_option("otp_{$email}");
           
           if (!$stored_otp) {
               return new WP_REST_Response(array(
                   'success' => false,
                   'message' => 'OTP not found or expired'
               ), 400);
           }
           
           // Check if OTP is expired
           if ($stored_otp['expiry'] < time()) {
               delete_option("otp_{$email}"); // Clean up expired OTP
               return new WP_REST_Response(array(
                   'success' => false,
                   'message' => 'OTP has expired'
               ), 400);
           }
           
           // Verify OTP
           if ($stored_otp['code'] == $otp) {
               // Clean up used OTP
               delete_option("otp_{$email}");
               
               // Create or retrieve WordPress user
               $user = get_user_by('email', $email);
               if (!$user) {
                   // Create new user
                   $user_id = wp_create_user($email, wp_generate_password(), $email);
                   if (is_wp_error($user_id)) {
                       return new WP_REST_Response(array(
                           'success' => false,
                           'message' => 'Failed to create user'
                       ), 500);
                   }
                   $user = get_user_by('ID', $user_id);
               }
               
               return new WP_REST_Response(array(
                   'success' => true,
                   'message' => 'OTP verified successfully',
                   'user' => array(
                       'id' => $user->ID,
                       'email' => $user->user_email,
                       // Add other user data as needed
                   )
               ), 200);
           } else {
               return new WP_REST_Response(array(
                   'success' => false,
                   'message' => 'Invalid OTP'
               ), 400);
           }
       }
   }
   
   new CustomOTPAuth();
   ```

3. Activate the plugin through WordPress admin dashboard

### 2. Configure Email Settings

1. Install an SMTP plugin like "WP Mail SMTP" to ensure reliable email delivery
2. Configure your email provider settings (Gmail, SendGrid, etc.)

### 3. Implement React UI Components

Create React components for the OTP flow:

```jsx
import React, { useState } from 'react';

const EmailOTPComponent = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState('email'); // 'email' or 'otp'
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const requestOTP = async () => {
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await fetch('/wp-json/custom/v1/otp/request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (data.success) {
                setStep('otp');
                setMessage(data.message);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Network error occurred');
        } finally {
            setLoading(false);
        }
    };

    const verifyOTP = async () => {
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await fetch('/wp-json/custom/v1/otp/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, otp }),
            });

            const data = await response.json();

            if (data.success) {
                setMessage(data.message);
                // Handle successful verification (e.g., redirect, store user info)
                console.log('User authenticated:', data.user);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Network error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {step === 'email' && (
                <div>
                    <h2>Enter your email</h2>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        disabled={loading}
                    />
                    <button onClick={requestOTP} disabled={loading}>
                        {loading ? 'Sending...' : 'Send OTP'}
                    </button>
                </div>
            )}

            {step === 'otp' && (
                <div>
                    <h2>Enter OTP</h2>
                    <p>Sent to: {email}</p>
                    <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Enter 6-digit OTP"
                        disabled={loading}
                    />
                    <button onClick={verifyOTP} disabled={loading}>
                        {loading ? 'Verifying...' : 'Verify OTP'}
                    </button>
                    <button onClick={() => setStep('email')}>Change Email</button>
                </div>
            )}

            {message && <div className="message">{message}</div>}
            {error && <div className="error">{error}</div>}
        </div>
    );
};

export default EmailOTPComponent;
```

### 4. Integrate with WooCommerce (Optional)

If you need to associate the authenticated user with WooCommerce:

1. Ensure the OTP verification creates or retrieves a WordPress user
2. WooCommerce will automatically associate the user with their account
3. You can access WooCommerce functionality through the user session

### 5. Security Enhancements

For production use, consider adding:

1. Rate limiting to prevent spam
2. OTP attempt limitations
3. More sophisticated storage (user meta instead of options table)
4. Session management
5. CSRF protection

## Testing

1. Test email delivery by entering an email and verifying OTP is received
2. Test OTP expiration (wait 5+ minutes and try again)
3. Test invalid OTP attempts
4. Test user creation/lookup functionality
5. Verify integration with WooCommerce if needed

## Troubleshooting

- **Emails not sending**: Check SMTP configuration and WordPress mail settings
- **API endpoints not working**: Verify plugin activation and WordPress REST API
- **CORS issues**: Configure your server to allow cross-origin requests if needed
- **OTP not working**: Check WordPress error logs for debugging information
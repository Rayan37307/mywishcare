# Passwordless OTP Authentication Guide for WordPress + WooCommerce + React

## Overview
This guide provides instructions for implementing passwordless OTP authentication (email or SMS) in a custom React UI while maintaining integration with WordPress/WooCommerce backend.

## Architecture

### Frontend (React)
- Custom UI components for email/phone input, OTP sending, and verification
- API calls to WordPress backend
- State management for OTP flow

### Backend (WordPress/WooCommerce)
- Custom plugin to handle OTP generation and validation
- REST API endpoints for communication
- Integration with WordPress user system
- Optional: Third-party SMS service (Twilio, AWS SES, etc.)

## Implementation Steps

### 1. Create Custom WordPress Plugin

1. Create a new folder in `/wp-content/plugins/`:
   ```
   /wp-content/plugins/passwordless-otp-auth/
   ```

2. Create the main plugin file `passwordless-otp-auth.php`:
   ```php
   <?php
   /**
    * Plugin Name: Passwordless OTP Authentication
    * Description: Provides passwordless OTP functionality for custom React UI
    * Version: 1.0
    */

   if (!defined('ABSPATH')) {
       exit;
   }

   class PasswordlessOTPAuth {
       
       public function __construct() {
           add_action('rest_api_init', array($this, 'register_routes'));
           add_action('wp_logout', array($this, 'clear_pending_otp'));
       }
       
       public function register_routes() {
           register_rest_route('passwordless/v1', '/otp/request', array(
               'methods' => 'POST',
               'callback' => array($this, 'request_otp'),
               'permission_callback' => '__return_true',
           ));
           
           register_rest_route('passwordless/v1', '/otp/verify', array(
               'methods' => 'POST',
               'callback' => array($this, 'verify_otp'),
               'permission_callback' => '__return_true',
           ));
           
           register_rest_route('passwordless/v1', '/logout', array(
               'methods' => 'POST',
               'callback' => array($this, 'logout_user'),
               'permission_callback' => function() {
                   return is_user_logged_in();
               }
           ));
       }
       
       public function request_otp($request) {
           $identifier = sanitize_text_field($request->get_param('identifier')); // email or phone
           $method = sanitize_text_field($request->get_param('method')); // 'email' or 'sms'
           
           if (empty($identifier) || !in_array($method, array('email', 'sms'))) {
               return new WP_REST_Response(array(
                   'success' => false,
                   'message' => 'Identifier and method are required'
               ), 400);
           }
           
           // Validate identifier format
           if ($method === 'email' && !is_email($identifier)) {
               return new WP_REST_Response(array(
                   'success' => false,
                   'message' => 'Invalid email address'
               ), 400);
           }
           
           // Generate random 6-digit OTP
           $otp = rand(100000, 999999);
           
           // Store OTP temporarily (valid for 5 minutes)
           $expiry = time() + (5 * 60); // 5 minutes
           $otp_key = 'otp_' . md5($identifier); // Use hash to avoid special characters in key
           update_option($otp_key, array(
               'code' => $otp,
               'expiry' => $expiry,
               'identifier' => $identifier,
               'method' => $method
           ));
           
           // Send OTP via email or SMS
           if ($method === 'email') {
               $success = $this->send_otp_email($identifier, $otp);
           } else {
               $success = $this->send_otp_sms($identifier, $otp);
           }
           
           if ($success) {
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
       
       private function send_otp_email($email, $otp) {
           $subject = 'Your Authentication Code';
           $message = "Your login code is: {$otp}\n\nThis code will expire in 5 minutes.";
           
           return wp_mail($email, $subject, $message);
       }
       
       private function send_otp_sms($phone, $otp) {
           // For SMS, you would typically use a service like Twilio
           // This is a placeholder - you'll need to implement actual SMS sending
           
           // Example Twilio implementation:
           /*
           $sid = 'your_twilio_account_sid';
           $token = 'your_twilio_auth_token';
           $twilio_phone = 'your_twilio_phone_number';
           
           $client = new Twilio\Rest\Client($sid, $token);
           
           try {
               $client->messages->create(
                   $phone,
                   array(
                       'from' => $twilio_phone,
                       'body' => "Your login code is: {$otp}. Valid for 5 minutes."
                   )
               );
               return true;
           } catch (Exception $e) {
               error_log("SMS sending failed: " . $e->getMessage());
               return false;
           }
           */
           
           // For now, return false as SMS implementation requires service integration
           return false;
       }
       
       public function verify_otp($request) {
           $identifier = sanitize_text_field($request->get_param('identifier'));
           $otp = $request->get_param('otp');
           
           if (empty($identifier) || empty($otp)) {
               return new WP_REST_Response(array(
                   'success' => false,
                   'message' => 'Identifier and OTP are required'
               ), 400);
           }
           
           // Retrieve stored OTP
           $otp_key = 'otp_' . md5($identifier);
           $stored_otp = get_option($otp_key);
           
           if (!$stored_otp) {
               return new WP_REST_Response(array(
                   'success' => false,
                   'message' => 'OTP not found or expired'
               ), 400);
           }
           
           // Check if OTP is expired
           if ($stored_otp['expiry'] < time()) {
               delete_option($otp_key); // Clean up expired OTP
               return new WP_REST_Response(array(
                   'success' => false,
                   'message' => 'OTP has expired'
               ), 400);
           }
           
           // Verify OTP
           if ($stored_otp['code'] == $otp) {
               // Clean up used OTP
               delete_option($otp_key);
               
               // Find or create user
               if (is_email($identifier)) {
                   $user = get_user_by('email', $identifier);
                   if (!$user) {
                       // Create new user
                       $username = sanitize_user(strtok($identifier, '@'));
                       $user_id = wp_create_user($username, wp_generate_password(), $identifier);
                       if (is_wp_error($user_id)) {
                           return new WP_REST_Response(array(
                               'success' => false,
                               'message' => 'Failed to create user'
                           ), 500);
                       }
                       $user = get_user_by('ID', $user_id);
                   }
               } else {
                   // For phone number authentication, you might need to create a custom field or use a plugin
                   // This is a basic example - you might need additional logic
                   $user = get_user_by('login', $identifier);
                   if (!$user) {
                       $user_id = wp_create_user($identifier, wp_generate_password(), $identifier . '@temp.com');
                       if (is_wp_error($user_id)) {
                           return new WP_REST_Response(array(
                               'success' => false,
                               'message' => 'Failed to create user'
                           ), 500);
                       }
                       $user = get_user_by('ID', $user_id);
                   }
               }
               
               // Generate auth token
               $auth_token = $this->generate_auth_token($user->ID);
               
               // Return success with user data and token
               return new WP_REST_Response(array(
                   'success' => true,
                   'message' => 'Successfully authenticated',
                   'user' => array(
                       'id' => $user->ID,
                       'email' => $user->user_email,
                       'username' => $user->user_login,
                       'display_name' => $user->display_name,
                   ),
                   'auth_token' => $auth_token
               ), 200);
           } else {
               return new WP_REST_Response(array(
                   'success' => false,
                   'message' => 'Invalid OTP'
               ), 400);
           }
       }
       
       private function generate_auth_token($user_id) {
           // Generate a secure token
           $token = wp_generate_password(32, false);
           $expiration = time() + (24 * 60 * 60); // 24 hours
           
           // Store token in user meta
           update_user_meta($user_id, 'passwordless_auth_token', $token);
           update_user_meta($user_id, 'passwordless_auth_token_expires', $expiration);
           
           return $token;
       }
       
       public function logout_user($request) {
           $user_id = get_current_user_id();
           if ($user_id) {
               delete_user_meta($user_id, 'passwordless_auth_token');
               delete_user_meta($user_id, 'passwordless_auth_token_expires');
           }
           
           wp_logout();
           
           return new WP_REST_Response(array(
               'success' => true,
               'message' => 'Successfully logged out'
           ), 200);
       }
       
       public function clear_pending_otp() {
           // This is called during logout to clean up any pending OTPs
           // Note: We don't have access to identifier at this point,
           // so this is more of a placeholder for potential cleanup
       }
   }
   
   new PasswordlessOTPAuth();
   ```

3. Activate the plugin through WordPress admin dashboard

### 2. (Optional) Configure SMS Service (e.g., Twilio)

If you want to support SMS OTP:

1. Sign up for Twilio and get your Account SID and Auth Token
2. Purchase a phone number for sending SMS
3. Install the Twilio PHP library via Composer (if using Composer) or include directly
4. Update the `send_otp_sms()` method in the plugin with your credentials

### 3. Configure Email Settings

1. Install an SMTP plugin like "WP Mail SMTP" to ensure reliable email delivery
2. Configure your email provider settings (Gmail, SendGrid, etc.)

### 4. Implement React UI Components

Create React components for the passwordless OTP flow:

```jsx
import React, { useState } from 'react';

const PasswordlessAuth = () => {
    const [identifier, setIdentifier] = useState('');
    const [otp, setOtp] = useState('');
    const [method, setMethod] = useState('email'); // 'email' or 'sms'
    const [step, setStep] = useState('identifier'); // 'identifier' or 'otp'
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [user, setUser] = useState(null);

    const requestOTP = async () => {
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await fetch('/wp-json/passwordless/v1/otp/request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    identifier: identifier.trim(), 
                    method 
                }),
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
            const response = await fetch('/wp-json/passwordless/v1/otp/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    identifier: identifier.trim(), 
                    otp 
                }),
            });

            const data = await response.json();

            if (data.success) {
                setMessage(data.message);
                setUser(data.user);
                // Store auth token in local storage or state management system
                localStorage.setItem('auth_token', data.auth_token);
                // Redirect to dashboard or perform other actions
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Network error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            const response = await fetch('/wp-json/passwordless/v1/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });

            const data = await response.json();
            
            if (data.success) {
                setUser(null);
                localStorage.removeItem('auth_token');
                setStep('identifier');
                setMessage('Successfully logged out');
            }
        } catch (err) {
            setError('Logout failed');
        }
    };

    if (user) {
        return (
            <div>
                <h2>Welcome, {user.display_name}!</h2>
                <p>You are logged in with email: {user.email}</p>
                <button onClick={handleLogout}>Logout</button>
            </div>
        );
    }

    return (
        <div className="passwordless-auth">
            {step === 'identifier' && (
                <div className="identifier-step">
                    <h2>Login with {method === 'email' ? 'Email' : 'Phone'}</h2>
                    
                    <div className="method-selector">
                        <label>
                            <input
                                type="radio"
                                value="email"
                                checked={method === 'email'}
                                onChange={(e) => setMethod(e.target.value)}
                            />
                            Email
                        </label>
                        <label>
                            <input
                                type="radio"
                                value="sms"
                                checked={method === 'sms'}
                                onChange={(e) => setMethod(e.target.value)}
                            />
                            SMS
                        </label>
                    </div>
                    
                    <input
                        type={method === 'email' ? 'email' : 'tel'}
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder={method === 'email' ? 'your@email.com' : 'Phone number'}
                        disabled={loading}
                    />
                    
                    <button 
                        onClick={requestOTP} 
                        disabled={loading || !identifier.trim()}
                    >
                        {loading ? 'Sending...' : `Send OTP via ${method === 'email' ? 'Email' : 'SMS'}`}
                    </button>
                </div>
            )}

            {step === 'otp' && (
                <div className="otp-step">
                    <h2>Enter OTP</h2>
                    <p>OTP sent to: {identifier}</p>
                    
                    <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Enter 6-digit OTP"
                        disabled={loading}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength="6"
                    />
                    
                    <button 
                        onClick={verifyOTP} 
                        disabled={loading || otp.length !== 6}
                    >
                        {loading ? 'Verifying...' : 'Verify OTP'}
                    </button>
                    
                    <button 
                        onClick={() => setStep('identifier')} 
                        disabled={loading}
                    >
                        Change {method === 'email' ? 'Email' : 'Phone'}
                    </button>
                </div>
            )}

            {message && <div className="message success">{message}</div>}
            {error && <div className="message error">{error}</div>}
        </div>
    );
};

export default PasswordlessAuth;
```

### 5. Add CSS Styling (Optional)

Add some basic styling to make the UI look better:

```css
.passwordless-auth {
    max-width: 400px;
    margin: 0 auto;
    padding: 20px;
}

.identifier-step, .otp-step {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.method-selector {
    display: flex;
    gap: 20px;
    margin: 10px 0;
}

.method-selector label {
    display: flex;
    align-items: center;
    gap: 5px;
    cursor: pointer;
}

.passwordless-auth input {
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
}

.passwordless-auth button {
    padding: 12px 20px;
    background-color: #007cba;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
}

.passwordless-auth button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
}

.message {
    padding: 10px;
    border-radius: 4px;
    margin-top: 10px;
}

.message.success {
    background-color: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
}

.message.error {
    background-color: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
}
```

### 6. Integrate with WooCommerce (Optional)

To ensure WooCommerce functionality works with passwordless auth:

1. The authenticated WordPress user will automatically have access to WooCommerce features
2. User's cart, orders, and account information will be preserved
3. No additional integration is needed as WooCommerce uses WordPress user system

### 7. Security Enhancements

For production use, add these security measures:

1. **Rate limiting**: Prevent spam by limiting OTP requests per identifier/IP
2. **Captcha integration**: Add reCAPTCHA to prevent bots
3. **Session management**: Implement proper session handling
4. **Token validation**: Validate auth tokens on each protected request
5. **Secure storage**: Consider using HTTP-only cookies instead of localStorage for tokens

## Testing

1. Test email OTP flow end-to-end
2. Test SMS OTP flow if implemented
3. Verify user creation and association with WooCommerce
4. Test token expiration
5. Test logout functionality
6. Test security measures (rate limiting, etc.)

## Troubleshooting

- **Emails not sending**: Check SMTP configuration and WordPress mail settings
- **SMS not sending**: Verify your SMS service credentials and implementation
- **API endpoints not working**: Ensure plugin is activated and REST API is accessible
- **CORS issues**: Configure server to allow cross-origin requests if needed
- **Token validation**: Implement proper token verification in protected routes
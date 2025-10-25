# Enable CORS Support for JWT Authentication Plugin in WordPress

## Steps to Fix "CORS Support: Disabled" Issue

### Step 1: Access Your WordPress Theme's functions.php File

1. Log into your WordPress admin dashboard
2. Go to **Appearance** → **Theme Editor**
3. In the right-hand side file list, find and click on **Theme Functions** (`functions.php`)
4. Alternatively, you can use your hosting control panel's file manager to edit `/wp-content/themes/your-theme-name/functions.php`

### Step 2: Add CORS Enabling Code

Add the following code to the very end of your `functions.php` file:

```php
// Enable CORS for JWT Authentication
add_action('rest_api_init', function () {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', 'custom_send_cors_headers');
});

function custom_send_cors_headers($value) {
    $origin = get_http_origin();
    if ($origin) {
        header('Access-Control-Allow-Origin: ' . esc_url_raw($origin));
    }
    header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Headers: Authorization, Content-Type, X-Requested-With, Accept, X-WP-Nonce, X-WP-REST-Nonce');
    return $value;
}

// Handle preflight OPTIONS requests for all REST API endpoints including JWT
add_action('init', function () {
    if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        if (isset($_SERVER['REQUEST_URI']) && 
            (strpos($_SERVER['REQUEST_URI'], '/wp-json/') !== false || 
             strpos($_SERVER['REQUEST_URI'], '/jwt-auth/') !== false)) {
            
            $origin = get_http_origin();
            if ($origin) {
                header('Access-Control-Allow-Origin: ' . esc_url_raw($origin));
            }
            header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
            header('Access-Control-Allow-Credentials: true');
            header('Access-Control-Allow-Headers: Authorization, Content-Type, X-Requested-With, Accept, X-WP-Nonce, X-WP-REST-Nonce');
            exit(0);
        }
    }
});

// Ensure Authorization header is available to WordPress
if (!function_exists('custom_override_nginx_headers')) {
    add_action('init', function () {
        if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] = $_SERVER['HTTP_AUTHORIZATION'];
        } elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
            $_SERVER['HTTP_AUTHORIZATION'] = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
        }
    });
}

// For Apache servers, ensure the Authorization header is passed through
add_action('mod_rewrite_rules', function($rules) {
    $rules .= "RewriteEngine On\nRewriteCond %{HTTP:Authorization} ^(.*)
RewriteRule .* - [E=HTTP_AUTHORIZATION:%1]\n";
    return $rules;
});
```

### Step 3: Update Your wp-config.php File

1. Access your `wp-config.php` file via FTP or your hosting control panel file manager
2. Add this line before the `/* That's all, stop editing! */` line:

```php
// JWT Authentication Secret Key
define('JWT_AUTH_SECRET_KEY', 'your-very-secure-secret-key-here');
```

3. If your JWT plugin supports it, you can also add:

```php
// Enable CORS for JWT plugin
define('JWT_AUTH_CORS_ENABLE', true);
```

### Step 4: Server Configuration (If You Have Access)

#### For Apache servers (add to `.htaccess` file in WordPress root):

```apache
# BEGIN CORS for JWT Authentication
<IfModule mod_rewrite.c>
RewriteEngine On
RewriteCond %{HTTP:Authorization} ^(.*)
RewriteRule .* - [E=HTTP_AUTHORIZATION:%1]
</IfModule>

<IfModule mod_headers.c>
Header set Access-Control-Allow-Origin "*"
Header set Access-Control-Allow-Methods "GET, POST, PUT, PATCH, DELETE, OPTIONS"
Header set Access-Control-Allow-Headers "Authorization, Content-Type, X-Requested-With, Accept, X-WP-Nonce, X-WP-REST-Nonce"
Header set Access-Control-Allow-Credentials "true"
</IfModule>
# END CORS for JWT Authentication
```

#### For Nginx servers (add to server configuration):

```nginx
# Ensure Authorization header gets passed to PHP
fastcgi_param HTTP_AUTHORIZATION $http_authorization;
fastcgi_param HTTP_X_WP_NONCE $http_x_wp_nonce;

# CORS headers
add_header Access-Control-Allow-Origin $http_origin always;
add_header Access-Control-Allow-Methods "GET, POST, PUT, PATCH, DELETE, OPTIONS" always;
add_header Access-Control-Allow-Headers "Authorization, Content-Type, X-Requested-With, Accept, X-WP-Nonce, X-WP-REST-Nonce" always;
add_header Access-Control-Allow-Credentials "true" always;

# Handle preflight OPTIONS requests
if ($request_method = 'OPTIONS') {
    add_header Access-Control-Allow-Origin $http_origin always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, PATCH, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Authorization, Content-Type, X-Requested-With, Accept, X-WP-Nonce, X-WP-REST-Nonce" always;
    add_header Access-Control-Allow-Credentials "true" always;
    add_header Content-Length 0;
    add_header Content-Type text/plain;
    return 200;
}
```

### Step 5: Clear Caches and Test

1. **Clear any caching**: If you're using caching plugins (like WP Super Cache, W3 Total Cache, etc.) or server-level caching, clear them all.
2. **Test your JWT endpoints**: Try logging in using your React application to verify that CORS errors are gone.
3. **Check browser console**: Make sure there are no more CORS-related errors.

### Step 6: Verify Plugin Settings

1. Go to your WordPress admin dashboard
2. Look for **JWT Authentication** settings (usually under Settings → JWT Authentication or in the plugin menu)
3. You should no longer see "CORS Support: Disabled" or the message should now indicate CORS is enabled
4. If there are specific CORS settings in the plugin UI, make sure to add your frontend domain (e.g., `http://localhost:5173` for Vite development)

### Security Note

For production environments, consider using a more restrictive CORS setup that only allows specific origins instead of wildcard (*):

```php
function custom_send_cors_headers_secure($value) {
    // Define allowed origins - adjust these to match your frontend URLs
    $allowed_origins = [
        'http://localhost:5173',  // Vite default
        'http://localhost:3000',  // Create React App default
        'https://yourdomain.com',
        'https://sajcaree.com'     // Your domain
    ];
    
    $origin = get_http_origin();
    if ($origin && in_array($origin, $allowed_origins, true)) {
        header('Access-Control-Allow-Origin: ' . esc_url_raw($origin));
    }
    
    header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Headers: Authorization, Content-Type, X-Requested-With, Accept, X-WP-Nonce, X-WP-REST-Nonce');
    
    return $value;
}
```

Once you've completed these steps, your JWT Authentication plugin should show CORS Support as enabled and your React application will be able to communicate with your WordPress backend without CORS errors.
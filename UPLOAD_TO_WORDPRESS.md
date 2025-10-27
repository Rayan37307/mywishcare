# Uploading React Application to WordPress Site

This guide provides step-by-step instructions to upload your React application to a WordPress site.

## Prerequisites

- WordPress site with admin access
- FTP client (like FileZilla) or file manager access
- Built React application (production build)
- Backup of your current WordPress site

## Step 1: Build Your React Application

1. In your project directory, run the following command to create a production build:
```bash
npm run build
```

2. This will create a `dist` folder (or `build` depending on your configuration) containing all the static files needed for deployment.

## Step 2: Prepare WordPress for React Integration

1. **Choose Integration Method:**
   - Option A: Replace WordPress theme entirely (recommended for full React app)
   - Option B: Add React as a custom page template
   - Option C: Host separately and embed via iframe

2. **For Option A (Complete Replacement)**:
   - Create a backup of your current WordPress theme
   - You will replace the theme files but keep WordPress backend functionality

## Step 3: Upload Files to WordPress

1. **Connect to Your Server:**
   - Using FTP: Connect to your server using your FTP client
   - Using cPanel: Access your file manager through your web hosting control panel

2. **Choose Upload Location:**
   - If replacing entire site: Upload to your site's root directory (often `public_html`, `www`, or `htdocs`)
   - If using subdirectory: Create a new folder (e.g., `/app/`) and upload files there

3. **Upload React Build Files:**
   - Upload all files from your `dist` (or `build`) folder
   - Make sure to upload `index.html`, CSS, JS, and all other assets

## Step 4: Update Configuration Files

1. **Update index.html:**
   - If uploading to a subdirectory, update any base URLs in `index.html`
   - Ensure paths to CSS and JS files are correct

2. **Update .env file values:**
   - Make sure your `VITE_WP_API_URL`, `VITE_WC_API_URL`, and other URLs point to your WordPress installation
   - Example: `VITE_WP_API_URL=https://yoursite.com/wp-json`

## Step 5: Configure WordPress Integration

1. **API Endpoint Setup:**
   - Ensure your WordPress REST API endpoints are accessible
   - Verify WooCommerce API credentials if needed
   - Configure any CORS settings if required

2. **URL Rewrites (if needed):**
   - If using subdirectories, update `.htaccess` for proper routing
   - For React Router, configure server to fallback to index.html for non-API routes

## Step 6: Update WordPress Configuration

1. **Modify wp-config.php** (if keeping WordPress for backend):
   - Add any necessary constants for your React app
   - Update WordPress site URLs if changing domain structure

2. **Update WordPress Permalinks:**
   - Go to WordPress Dashboard → Settings → Permalinks
   - You may need to save permalinks to refresh rewrite rules

## Step 7: Update Environment Variables

1. In your React application, update environment variables in your build process:
   ```
   VITE_WP_API_URL=https://yourdomain.com/wp-json
   VITE_WC_API_URL=https://yourdomain.com/wp-json/wc/v3
   VITE_WC_CONSUMER_KEY=your_actual_consumer_key
   VITE_WC_CONSUMER_SECRET=your_actual_consumer_secret
   ```

2. These values should be used in your build process, not uploaded as files

## Step 8: Testing

1. **Frontend Testing:**
   - Visit your domain to check if the React app loads correctly
   - Verify all pages and functionality work as expected
   - Test form submissions and API calls

2. **API Testing:**
   - Verify authentication works properly
   - Test order creation and retrieval
   - Check cart functionality
   - Ensure user profiles work correctly

3. **WordPress Backend:**
   - Verify WordPress admin panel still works
   - Check that WooCommerce functionality remains intact if applicable

## Step 9: Troubleshooting

### Common Issues:

1. **API Calls Not Working:**
   - Check if your WordPress REST API is accessible: `https://yoursite.com/wp-json`
   - Verify your API credentials are correct
   - Ensure CORS headers are properly configured

2. **Static Assets Not Loading:**
   - Check if CSS/JS paths in `index.html` are correct
   - Ensure all files were uploaded completely

3. **Routing Issues:**
   - For React Router, ensure server fallbacks to index.html for non-API routes
   - Update the `basename` property in your Router if using subdirectories

### WordPress-Specific Issues:

1. **Admin Access:**
   - If you replaced the theme directory, ensure `wp-admin` is still accessible
   - You may need to adjust paths in your server configuration

2. **Plugin Conflicts:**
   - Some WordPress plugins may interfere with React app functionality
   - Test with default WordPress theme to isolate issues

## Step 10: Final Steps

1. **Performance Optimization:**
   - Enable GZIP compression for static assets
   - Configure browser caching for static files
   - Optimize images and assets

2. **SEO Considerations:**
   - Add proper meta tags in your React app
   - Consider SEO implications when removing WordPress structure
   - Set up proper sitemap if needed

3. **Security Considerations:**
   - Ensure API endpoints are properly secured
   - Implement proper authentication and authorization
   - Update WordPress installation security settings

## Alternative: WordPress Plugin Approach

Instead of complete replacement, you might consider:

1. Creating a WordPress plugin that serves your React app
2. Using a custom theme that embeds your React app
3. Creating a page template that loads your React application

## Important Notes

- **Backup First**: Always backup your WordPress site before making changes
- **API Access**: WordPress backend will remain accessible at `/wp-admin/`
- **SEO Impact**: Consider SEO implications of replacing WordPress content with React app
- **Maintenance**: Updates to WordPress core, themes, and plugins may need special attention

## Contact Support

If you encounter issues during the upload process, please contact your web hosting provider for server-specific configuration assistance.
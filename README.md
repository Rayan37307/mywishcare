# MyWishCare - React Frontend with WordPress Backend

This is the React frontend for the MyWishCare application, designed to integrate with a WordPress backend using JWT authentication and comprehensive tracking analytics.

## Features

- React 19 with TypeScript
- WordPress integration via REST API
- JWT authentication system
- OTP (One-Time Password) authentication
- Client-side and Server-side Meta Pixel tracking
- Google Analytics 4 integration
- TikTok Pixel integration
- WooCommerce integration
- Responsive design with Tailwind CSS
- Modern UI with animations using GSAP

## Prerequisites

- Node.js (v18 or higher)
- pnpm package manager
- WordPress site with JWT Authentication plugin
- Meta Pixel ID and Access Token
- Google Analytics 4 Measurement ID
- TikTok Pixel ID

## Installation

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd mywishcare
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Configuration

Copy the `.env.example` file to `.env` and update the values:

```env
# WordPress API Configuration
VITE_WP_API_URL=https://yourdomain.com/wp-json
VITE_WC_API_URL=https://yourdomain.com/wp-json/wc/v3

# WooCommerce API (if using e-commerce features)
VITE_WC_CONSUMER_KEY=your_consumer_key
VITE_WC_CONSUMER_SECRET=your_consumer_secret

# Analytics and Tracking
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_FACEBOOK_PIXEL_ID=XXXXXXXXXXXXXXX
VITE_FACEBOOK_TEST_EVENT_CODE=TEST_EVENT_CODE  # Optional: Use for testing Meta Pixel events
VITE_TIKTOK_PIXEL_ID=AAAAAAAAAAAA

# Google Gemini API (if using AI features)
VITE_GEMINI_API_KEY=your_gemini_api_key
```

## WordPress Backend Setup

### 1. Install Required Plugins

- JWT Authentication for WP REST API
- WooCommerce (if using e-commerce features)

### 2. Configure JWT Authentication

1. Install and activate the JWT Authentication plugin
2. Generate a secret key: `openssl rand -base64 32`
3. Add to your `wp-config.php`:
```php
define('JWT_AUTH_SECRET_KEY', 'your-generated-secret-key');
```

### 3. Server-Side Meta Pixel Setup

Add the server-side tracking functionality to your WordPress theme's `functions.php` file or create a custom plugin using the code from `server-side-meta-pixel-implementation.php`.

Access the admin settings page at `Settings > Meta Pixel` to configure your Meta Pixel ID and Access Token.

## Development

### Start Development Server

```bash
pnpm dev
```

### Build for Production

```bash
pnpm build
```

### Linting

```bash
pnpm lint
```

## Tracking Implementation

The application includes comprehensive tracking capabilities:

### Client-Side Tracking
- Google Analytics 4
- Meta Pixel (Facebook)
- TikTok Pixel

### Server-Side Tracking
- Meta Pixel server-side events
- Enhanced e-commerce tracking
- Better privacy compliance
- Improved conversion attribution

All tracking is handled through the `pixelYourSiteService` which provides a unified interface for all tracking events.

## Authentication System

### JWT Authentication
- Standard username/password authentication
- Token-based sessions
- Automatic token refresh

### OTP Authentication
- Email-based one-time passwords
- Automatic user creation if not exists
- Secure temporary token storage

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Create production build
- `pnpm lint` - Run ESLint
- `pnpm preview` - Preview production build

## Project Structure

```
src/
├── components/      # React components
├── config/          # Configuration files
├── constants/       # Application constants
├── contexts/        # React contexts
├── hooks/           # Custom React hooks
├── pages/           # Page components
├── services/        # Service implementations
├── store/           # State management (Zustand)
├── tests/           # Test files
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
```

## API Integration

The application communicates with WordPress through:

- WordPress REST API
- WooCommerce REST API (if e-commerce is enabled)
- Custom endpoints for OTP authentication
- Server-side Meta Pixel tracking endpoints

## Testing Tracking

A test component is available at `src/components/PixelYourSiteTest.tsx` that allows you to test all tracking events. You can add this component temporarily during development to verify tracking is working correctly.

## Troubleshooting

### WordPress API Issues
- Ensure REST API endpoints are accessible
- Check JWT authentication configuration
- Verify CORS settings if needed

### Tracking Issues
- Check browser network tab for tracking requests
- Use Facebook Pixel Helper browser extension
- Verify server-side tracking in WordPress error logs

## Security Considerations

- Keep JWT secret keys secure
- Use HTTPS for all API requests
- Regularly update WordPress and plugins
- Implement proper input validation

## Deployment

The React application is designed to be built and deployed separately from WordPress, but can be integrated in several ways:

1. Subdirectory integration
2. Separate domain with API communication
3. Embedded via iframe (not recommended)
4. Single-page application approach

For detailed deployment instructions, see `UPLOAD_TO_WORDPRESS.md`.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
# PixelYourSite Integration for React App

This document explains how the PixelYourSite functionality has been implemented in the React application to match the tracking capabilities of the PixelYourSite WordPress plugin.

## Overview

The PixelYourSite integration allows the React frontend to track user interactions and e-commerce events (like product views, add to cart, checkout, and purchases) using the same tracking systems that PixelYourSite would use on a WordPress site. This includes:

- Google Analytics 4
- Meta (Facebook) Pixel (Client-side and Server-side)
- TikTok Pixel
- Additional pixel providers supported by PixelYourSite

## Implementation

### Core Service

The main implementation is in `src/services/pixelYourSiteService.ts`, which provides a unified interface for all tracking operations. This service:

- Initializes all supported tracking pixels
- Provides methods for common e-commerce events
- Uses the existing `analyticsService` as its foundation
- Integrates both client-side and server-side Meta Pixel tracking
- Ensures consistency across the application

### Server-Side Meta Pixel Implementation

The server-side Meta Pixel tracking is implemented through custom WordPress REST API endpoints that allow your React app to send events directly to Meta's servers from your WordPress backend. This provides:

- Enhanced reliability (not blocked by ad blockers)
- Improved conversion tracking
- Better privacy compliance (with hashed user data)
- Accurate attribution modeling

### Environment Variables

Add these variables to your `.env` file:

```
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_FACEBOOK_PIXEL_ID=XXXXXXXXXXXXXXX
VITE_TIKTOK_PIXEL_ID=AAAAAAAAAAAA
VITE_WP_API_URL=https://yourdomain.com/wp-json
```

### WordPress Setup

To enable server-side Meta Pixel tracking, you need to:

1. Add the server-side tracking code to your WordPress theme's `functions.php` file or create a custom plugin
2. Configure the Meta Pixel ID and Access Token through the WordPress admin settings page
3. The endpoints are:
   - `/wp-json/meta-pixel/v1/track` - For general events
   - `/wp-json/meta-pixel/v1/purchase` - For purchase events

### Event Tracking

The following events are automatically tracked:

- **Product Views**: When a user visits a product page
- **Add to Cart**: When a user adds a product to their cart
- **Checkout Start**: When a user begins the checkout process
- **Purchases**: When a user completes an order
- **Page Views**: When pages load
- **Search Events**: When users search on the site
- **Lead Generation**: When users submit forms

### Components Updated

Several components have been updated to use PixelYourSite tracking:

- `ProductDetail.tsx` - Tracks product views and add to cart events
- `CartSlide.tsx` - Tracks cart interactions and checkout starts
- `CartItem.tsx` - Tracks cart item changes
- `Checkout.tsx` - Tracks checkout process and purchases
- `cartStore.ts` - Tracks all cart operations

## Usage in Components

To use PixelYourSite tracking in your components:

```typescript
import { pixelYourSiteService, MetaPixelUserData } from '../services/pixelYourSiteService';

// Track a product view
pixelYourSiteService.trackProductView({
  product_id: product.id,
  product_name: product.name,
  product_price: product.price,
  currency: 'BDT',
  value: product.price,
});

// Track a product view with user data for server-side tracking
const userData: MetaPixelUserData = {
  email: 'user@example.com',
  first_name: 'John',
  last_name: 'Doe',
  city: 'Dhaka',
  country: 'BD',
};

pixelYourSiteService.trackProductView({
  product_id: product.id,
  product_name: product.name,
  product_price: product.price,
  currency: 'BDT',
  value: product.price,
}, userData);

// Track add to cart
pixelYourSiteService.trackAddToCart({
  product_id: product.id,
  product_name: product.name,
  product_price: product.price,
  currency: 'BDT',
  quantity: 1,
  value: product.price,
}, userData);
```

## PixelYourSite Compatible Events

The implementation supports the following PixelYourSite-compatible events:

- `trackProductView()` - Equivalent to ViewContent event
- `trackAddToCart()` - Equivalent to AddToCart event
- `trackCheckoutStart()` - Equivalent to InitiateCheckout event
- `trackPurchase()` - Equivalent to Purchase event
- `trackSearch()` - Tracks search events
- `trackCustomEvent()` - Tracks custom events
- `trackPageView()` - Tracks page views
- `trackLead()` - Tracks lead generation
- `trackRegistration()` - Tracks user registration
- `trackLogin()` - Tracks user login

## Testing

A test component is available at `src/components/PixelYourSiteTest.tsx` that allows you to test all tracking events. You can add this component temporarily during development to verify tracking is working correctly.

## Verification

To verify that tracking is working:

1. Open your browser's developer tools
2. Go to the Network tab
3. Look for requests to Google Analytics, Facebook Pixel, or TikTok Pixel
4. Trigger tracking events and confirm they appear in the network requests

For server-side tracking verification:
1. Check your WordPress error logs
2. Monitor Meta Events Manager for server-side events (they'll be marked as such)
3. Use Facebook's Conversions API Helper tool

You can also use browser extensions like:
- Facebook Pixel Helper
- Google Analytics Debugger
- TikTok Pixel Helper

## Analytics Dashboard

The analytics dashboard at `/analytics` now includes data from the PixelYourSite tracking, including:

- Product tracking
- Checkout analysis
- Fraud protection
- Pixel verification

## Server-Side Tracking Configuration

To set up server-side tracking in WordPress:

1. Add the server-side Meta Pixel code from `server-side-meta-pixel-implementation.php` to your WordPress theme's `functions.php` file
2. Access the admin settings page at `Settings > Meta Pixel` in your WordPress admin
3. Enter your Meta Pixel ID and Access Token
4. The WordPress site will now handle server-side tracking requests from your React app

## Migration Notes

If you were previously using `analyticsService` directly, you can now use `pixelYourSiteService` which provides the same functionality plus additional PixelYourSite-compatible features.

For existing services like `productTrackingService` and `checkoutTrackingService`, they now use `pixelYourSiteService` internally, providing full compatibility with PixelYourSite tracking standards.

The implementation now includes both client-side and server-side tracking for Meta Pixel, providing more reliable and comprehensive analytics.
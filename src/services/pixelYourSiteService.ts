// services/pixelYourSiteService.ts
// PixelYourSite-compatible service for React application
// Provides the same tracking capabilities as the PixelYourSite WordPress plugin
// Now includes BOTH client-side and server-side Meta Pixel tracking

import { serverSideMetaPixelService } from './serverSideMetaPixelService';
import { generateConsistentEventId, generateEventId } from '../utils/analyticsUtils';

// Types for PixelYourSite events
export interface PixelYourSiteProductData {
  product_id: string | number;
  product_name: string;
  product_category?: string;
  product_price?: number;
  currency?: string;
  quantity?: number;
  value?: number;
  content_type?: string;
  user_id?: string | number;  // Optional user ID for consistent tracking
}

export interface PixelYourSiteCartData {
  value: number;
  currency: string;
  contents: Array<{
    id: string | number;
    quantity: number;
    item_price?: number;
  }>;
}

export interface PixelYourSiteCheckoutData {
  value: number;
  currency: string;
  contents: Array<{
    id: string | number;
    quantity: number;
    item_price?: number;
  }>;
  order_id?: string;
}

// User data for server-side tracking
export interface MetaPixelUserData {
  email?: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  city?: string;
  state?: string;
  country?: string;
  zip?: string;
}

// PixelYourSite service class
class PixelYourSiteService {
  private isInitialized = false;
  private trackingEnabled = true;

  // Initialize PixelYourSite-compatible tracking
  initialize(): void {
    // Load Meta Pixel if not already loaded
    this.loadMetaPixel();

    // PixelYourSite tracking is ready
    this.isInitialized = true;

    // Track page view when PixelYourSite is initialized
    this.trackPageView();
  }

  // Load Meta Pixel script
  private loadMetaPixel(): void {
    const fbPixelId = import.meta.env.VITE_FACEBOOK_PIXEL_ID;
    const testEventCode = import.meta.env.VITE_FACEBOOK_TEST_EVENT_CODE;

    if (typeof window !== 'undefined' && !window.fbq && fbPixelId) {
      // Load Facebook Pixel script
      (function(f: any, b: any, e: any, v: any) {
        if (f.fbq) return;
        var n: any = f.fbq = function() {
          n.callMethod ?
          n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = !0;
        n.version = '2.0';
        n.queue = [];
        var t = b.createElement(e);
        t.async = !0;
        t.src = v;
        var s = b.getElementsByTagName(e)[0];
        if (s && s.parentNode) {
          s.parentNode.insertBefore(t, s);
        } else {
          // Fallback: append to head if we can't find a parent
          var head = b.head || b.getElementsByTagName('head')[0];
          if (head) {
            head.appendChild(t);
          }
        }
      })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

      // Initialize with pixel ID
      fbq('init', fbPixelId);

      // If test event code is provided, enable test mode
      if (testEventCode) {
        fbq('set', 'test_event_code', testEventCode);
      }

      fbq('track', 'PageView');
    } else if (typeof window !== 'undefined' && window.fbq && testEventCode) {
      // If fbq is already loaded but test event code is set, set it
      fbq('set', 'test_event_code', testEventCode);
    }
  }

  // Enable/disable tracking
  setTrackingEnabled(enabled: boolean): void {
    this.trackingEnabled = enabled;
  }

  // Track page views (standard PixelYourSite event)
  trackPageView(pageTitle?: string, pageUrl?: string, userData?: MetaPixelUserData): void {
    if (!this.trackingEnabled || !this.isInitialized) return;

    // Generate a consistent event ID for both client and server tracking
    const eventId = generateEventId('PageView');

    // Track with client-side Meta Pixel (browser)
    if (typeof window !== 'undefined' && window.fbq) {
      const params: any = {
        page_title: pageTitle,
        page_url: pageUrl,
        event_id: eventId,  // Add consistent event ID
      };
      const testEventCode = import.meta.env.VITE_FACEBOOK_TEST_EVENT_CODE;
      if (testEventCode) {
        params.test_event_code = testEventCode;
      }
      fbq('track', 'PageView', params);
    }

    // Track with server-side Meta Pixel for enhanced reliability
    if (typeof window !== 'undefined' && window.location) {
      serverSideMetaPixelService.trackPageView(pageTitle, pageUrl, userData, eventId);
    }
  }

  // Track product views (equivalent to PixelYourSite's ViewContent)
  trackProductView(productData: PixelYourSiteProductData, userData?: MetaPixelUserData): void {
    if (!this.trackingEnabled || !this.isInitialized) return;

    // Generate a consistent event ID for both client and server tracking
    const eventId = productData.user_id
      ? generateConsistentEventId('ViewContent', productData.product_id, productData.user_id)
      : generateConsistentEventId('ViewContent', productData.product_id);

    // Track with client-side Meta Pixel (browser)
    if (typeof window !== 'undefined' && window.fbq) {
      const params: any = {
        content_ids: [productData.product_id],
        content_name: productData.product_name,
        content_type: 'product',
        value: productData.value,
        currency: productData.currency,
        event_id: eventId,  // Add consistent event ID
      };
      const testEventCode = import.meta.env.VITE_FACEBOOK_TEST_EVENT_CODE;
      if (testEventCode) {
        params.test_event_code = testEventCode;
      }
      fbq('track', 'ViewContent', params);
    }

    // Track with server-side Meta Pixel for enhanced reliability
    serverSideMetaPixelService.trackProductView(productData, userData, eventId);
  }

  // Track add to cart (equivalent to PixelYourSite's AddToCart)
  trackAddToCart(productData: PixelYourSiteProductData, userData?: MetaPixelUserData): void {
    if (!this.trackingEnabled || !this.isInitialized) return;

    // Generate a consistent event ID for both client and server tracking
    const eventId = productData.user_id
      ? generateConsistentEventId('AddToCart', productData.product_id, productData.user_id)
      : generateConsistentEventId('AddToCart', productData.product_id);

    // Track with client-side Meta Pixel (browser)
    if (typeof window !== 'undefined' && window.fbq) {
      const params: any = {
        content_ids: [productData.product_id],
        content_name: productData.product_name,
        content_type: 'product',
        value: productData.value,
        currency: productData.currency,
        event_id: eventId,  // Add consistent event ID
      };
      const testEventCode = import.meta.env.VITE_FACEBOOK_TEST_EVENT_CODE;
      if (testEventCode) {
        params.test_event_code = testEventCode;
      }
      fbq('track', 'AddToCart', params);
    }

    // Track with server-side Meta Pixel for enhanced reliability
    serverSideMetaPixelService.trackAddToCart(productData, userData, eventId);
  }

  // Track cart contents (PixelYourSite's custom cart event) - removed InitiateCheckout tracking
  trackCart(_cartData: PixelYourSiteCartData, _userData?: MetaPixelUserData): void {
    if (!this.trackingEnabled || !this.isInitialized) return;

    // Removed InitiateCheckout tracking to avoid unwanted events
  }

  // Track checkout start (equivalent to PixelYourSite's InitiateCheckout) - removed completely
  trackCheckoutStart(_checkoutData: PixelYourSiteCheckoutData, _userData?: MetaPixelUserData): void {
    if (!this.trackingEnabled || !this.isInitialized) return;

    // Removed InitiateCheckout tracking to avoid unwanted events
  }

  // Track purchase (equivalent to PixelYourSite's Purchase)
  trackPurchase(checkoutData: PixelYourSiteCheckoutData, userData?: MetaPixelUserData): void {
    if (!this.trackingEnabled || !this.isInitialized) return;

    // Generate a consistent event ID for both client and server tracking
    const eventId = checkoutData.order_id
      ? generateConsistentEventId('Purchase', checkoutData.order_id)
      : generateEventId('Purchase');

    // Track with client-side Meta Pixel (browser)
    if (typeof window !== 'undefined' && window.fbq) {
      const params: any = {
        content_ids: checkoutData.contents.map(c => c.id),
        contents: checkoutData.contents,
        value: checkoutData.value,
        currency: checkoutData.currency,
        event_id: eventId,  // Add consistent event ID
      };
      const testEventCode = import.meta.env.VITE_FACEBOOK_TEST_EVENT_CODE;
      if (testEventCode) {
        params.test_event_code = testEventCode;
      }
      fbq('track', 'Purchase', params);
    }

    // Also track with server-side Meta Pixel for enhanced reliability
    if (checkoutData.order_id) {
      serverSideMetaPixelService.trackPurchase(
        checkoutData.order_id,
        checkoutData.value,
        checkoutData.currency,
        checkoutData.contents,
        userData,
        eventId // Pass the event ID
      );
    }
  }

  // Track search (PixelYourSite also tracks search events)
  trackSearch(searchTerm: string, resultsCount?: number, userData?: MetaPixelUserData): void {
    if (!this.trackingEnabled || !this.isInitialized) return;

    // Generate a consistent event ID for both client and server tracking
    const eventId = generateConsistentEventId('Search', searchTerm.substring(0, 10)); // Use first 10 chars of search term

    // Track with client-side Meta Pixel (browser)
    if (typeof window !== 'undefined' && window.fbq) {
      const params: any = {
        search_string: searchTerm,
        ...(resultsCount !== undefined && { search_results: resultsCount }),
        event_id: eventId,  // Add consistent event ID
      };
      const testEventCode = import.meta.env.VITE_FACEBOOK_TEST_EVENT_CODE;
      if (testEventCode) {
        params.test_event_code = testEventCode;
      }
      fbq('trackCustom', 'Search', params);
    }

    // Track with server-side Meta Pixel for enhanced reliability
    serverSideMetaPixelService.trackSearch(searchTerm, resultsCount, userData, eventId);
  }

  // Track lead generation (for contact forms, etc.)
  trackLead(formData: any, userData?: MetaPixelUserData): void {
    if (!this.trackingEnabled || !this.isInitialized) return;

    // Generate a consistent event ID for both client and server tracking
    const eventId = generateEventId('Lead');

    // Track with client-side Meta Pixel (browser)
    if (typeof window !== 'undefined' && window.fbq) {
      const testEventCode = import.meta.env.VITE_FACEBOOK_TEST_EVENT_CODE;
      const params: any = {
        ...formData,
        event_id: eventId,  // Add consistent event ID
      };
      if (testEventCode) {
        params.test_event_code = testEventCode;
      }
      fbq('track', 'Lead', params);
    }

    // Track with server-side Meta Pixel for enhanced reliability
    serverSideMetaPixelService.trackLead(formData, userData, eventId);
  }

  // Track custom events (PixelYourSite allows custom events)
  trackCustomEvent(eventName: string, parameters?: Record<string, any>, userData?: MetaPixelUserData): void {
    if (!this.trackingEnabled || !this.isInitialized) return;

    // Track with client-side Meta Pixel (browser)
    if (typeof window !== 'undefined' && window.fbq) {
      const testEventCode = import.meta.env.VITE_FACEBOOK_TEST_EVENT_CODE;
      const params: any = { ...parameters };
      if (testEventCode) {
        params.test_event_code = testEventCode;
      }
      fbq('trackCustom', eventName, params);
    }

    // Track with server-side Meta Pixel for enhanced reliability
    serverSideMetaPixelService.trackEvent({
      event_name: eventName,
      custom_data: parameters,
      user_data: userData,
      event_id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });
  }

  // Enhanced e-commerce tracking methods that PixelYourSite supports

  // Track product list view (when viewing a list of products)
  trackProductListView(_category: string | undefined, products?: PixelYourSiteProductData[], userData?: MetaPixelUserData): void {
    if (!this.trackingEnabled || !this.isInitialized) return;

    // For server-side, we'll track as a custom event or ViewContent if single product
    if (products && products.length === 1) {
      // Track with client-side Meta Pixel (browser)
      if (typeof window !== 'undefined' && window.fbq) {
        const params: any = {
          content_ids: [products[0].product_id],
          content_name: products[0].product_name,
          content_type: 'product',
          value: products[0].value,
          currency: products[0].currency,
        };
        const testEventCode = import.meta.env.VITE_FACEBOOK_TEST_EVENT_CODE;
        if (testEventCode) {
          params.test_event_code = testEventCode;
        }
        fbq('track', 'ViewContent', params);
      }

      serverSideMetaPixelService.trackProductView(products[0], userData);
    }
  }

  // Track product clicks (when clicking on a product in a list)
  trackProductClick(productData: PixelYourSiteProductData, _listName: string | undefined, userData?: MetaPixelUserData): void {
    if (!this.trackingEnabled || !this.isInitialized) return;

    // Track with client-side Meta Pixel (browser)
    if (typeof window !== 'undefined' && window.fbq) {
      const params: any = {
        content_ids: [productData.product_id],
        content_name: productData.product_name,
        content_type: 'product',
        value: productData.value,
        currency: productData.currency,
      };
      const testEventCode = import.meta.env.VITE_FACEBOOK_TEST_EVENT_CODE;
      if (testEventCode) {
        params.test_event_code = testEventCode;
      }
      fbq('track', 'ViewContent', params);
    }

    // For server-side, log as ViewContent since there's no direct equivalent
    serverSideMetaPixelService.trackProductView(productData, userData);
  }


  // Track payment info (when payment details are entered)
  trackPaymentInfo(checkoutData: PixelYourSiteCheckoutData, userData?: MetaPixelUserData): void {
    if (!this.trackingEnabled || !this.isInitialized) return;

    // Track with client-side Meta Pixel (browser)
    if (typeof window !== 'undefined' && window.fbq) {
      const params: any = {
        contents: checkoutData.contents,
        value: checkoutData.value,
        currency: checkoutData.currency,
      };
      const testEventCode = import.meta.env.VITE_FACEBOOK_TEST_EVENT_CODE;
      if (testEventCode) {
        params.test_event_code = testEventCode;
      }
      fbq('track', 'AddPaymentInfo', params);
    }

    // Also track with server-side Meta Pixel
    serverSideMetaPixelService.trackAddPaymentInfo(checkoutData, userData);
  }

  // Track shipping info (when shipping details are entered)
  trackShippingInfo(checkoutData: PixelYourSiteCheckoutData, userData?: MetaPixelUserData): void {
    if (!this.trackingEnabled || !this.isInitialized) return;

    // Track with client-side Meta Pixel (browser)
    if (typeof window !== 'undefined' && window.fbq) {
      const params: any = {
        contents: checkoutData.contents,
        value: checkoutData.value,
        currency: checkoutData.currency,
      };
      const testEventCode = import.meta.env.VITE_FACEBOOK_TEST_EVENT_CODE;
      if (testEventCode) {
        params.test_event_code = testEventCode;
      }
      fbq('trackCustom', 'AddShippingInfo', params);
    }

    // For server-side, we can track as a custom event
    serverSideMetaPixelService.trackEvent({
      event_name: 'AddShippingInfo',
      custom_data: checkoutData,
      user_data: userData,
      event_id: `shipping_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });
  }

  // Track registration/sign up
  trackRegistration(method: string, userData?: MetaPixelUserData): void {
    if (!this.trackingEnabled || !this.isInitialized) return;

    // Generate a consistent event ID for both client and server tracking
    const eventId = generateConsistentEventId('CompleteRegistration', method);

    // Track with client-side Meta Pixel (browser)
    if (typeof window !== 'undefined' && window.fbq) {
      const params: any = {
        method: method,
        event_id: eventId, // Add consistent event ID
      };
      const testEventCode = import.meta.env.VITE_FACEBOOK_TEST_EVENT_CODE;
      if (testEventCode) {
        params.test_event_code = testEventCode;
      }
      fbq('track', 'CompleteRegistration', params);
    }

    // Also track with server-side Meta Pixel for enhanced reliability
    serverSideMetaPixelService.trackRegistration(userData, method, eventId);
  }

  // Track login
  trackLogin(method: string, userData?: MetaPixelUserData): void {
    if (!this.trackingEnabled || !this.isInitialized) return;

    // Track with client-side Meta Pixel (browser)
    if (typeof window !== 'undefined' && window.fbq) {
      const params: any = {
        method: method
      };
      const testEventCode = import.meta.env.VITE_FACEBOOK_TEST_EVENT_CODE;
      if (testEventCode) {
        params.test_event_code = testEventCode;
      }
      fbq('trackCustom', 'Login', params);
    }

    // For server-side, we'll track as a custom event since there's no direct login event
    serverSideMetaPixelService.trackEvent({
      event_name: 'Login',
      custom_data: { method },
      user_data: userData,
      event_id: `login_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });
  }

  // Get all available tracking providers
  getTrackingProviders(): string[] {
    return ['Meta Pixel (Browser)', 'Meta Pixel (Server)'];
  }

  // Check if specific provider is active
  isProviderActive(provider: string): boolean {
    // This would check if the specific pixel is properly loaded
    if (typeof window === 'undefined') return false;

    switch(provider.toLowerCase()) {
      case 'meta pixel (browser)':
        return typeof window.fbq !== 'undefined';
      case 'meta pixel (server)':
        return true; // Server-side tracking is always available if the service is initialized
      default:
        return false;
    }
  }
}

// Create singleton instance
export const pixelYourSiteService = new PixelYourSiteService();

// Initialize the service when imported
if (typeof window !== 'undefined') {
  pixelYourSiteService.initialize();
}

// Global types for Meta Pixel
declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }

  var fbq: any;
}


// services/pixelYourSiteService.ts
// PixelYourSite-compatible service for React application
// Provides the same tracking capabilities as the PixelYourSite WordPress plugin
// Now includes both client-side and server-side Meta Pixel tracking with consistent event IDs

import { analyticsService } from './analyticsService';
import { serverSideMetaPixelService } from './serverSideMetaPixelService';
import { generateEventId } from './eventIdGenerator';

// Types for PixelYourSite events
interface PixelYourSiteProductData {
  product_id: string | number;
  product_name: string;
  product_category?: string;
  product_price?: number;
  currency?: string;
  quantity?: number;
  value?: number;
  content_type?: string;
}

interface PixelYourSiteCartData {
  value: number;
  currency: string;
  contents: Array<{
    id: string | number;
    quantity: number;
    item_price?: number;
  }>;
}

interface PixelYourSiteCheckoutData {
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
interface MetaPixelUserData {
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
  private trackedEvents = new Set<string>(); // To prevent duplicate tracking

  // Initialize PixelYourSite-compatible tracking
  initialize(): void {
    // PixelYourSite tracking is ready - it leverages existing analyticsService
    this.isInitialized = true;

    // Track page view when PixelYourSite is initialized
    this.trackPageView();
  }

  // Enable/disable tracking
  setTrackingEnabled(enabled: boolean): void {
    this.trackingEnabled = enabled;
    analyticsService.setTrackingEnabled(enabled);
  }

  // Helper method to check if an event was already tracked
  private isEventTracked(eventId: string): boolean {
    return this.trackedEvents.has(eventId);
  }

  // Helper method to mark an event as tracked
  private markEventAsTracked(eventId: string): void {
    this.trackedEvents.add(eventId);
    // Clean up old entries to prevent memory leaks (keep only last 1000 events)
    if (this.trackedEvents.size > 1000) {
      const entries = Array.from(this.trackedEvents.entries());
      for (let i = 0; i < entries.length - 500; i++) { // Keep last 500
        this.trackedEvents.delete(entries[i][0]);
      }
    }
  }

  // Track page views (standard PixelYourSite event)
  trackPageView(pageTitle?: string, pageUrl?: string, userData?: MetaPixelUserData): void {
    if (!this.trackingEnabled || !this.isInitialized) return;

    // Generate consistent event ID for both client and server
    const eventId = generateEventId('PageView', {pageTitle, pageUrl});

    // Prevent duplicate tracking
    if (this.isEventTracked(eventId)) {
      console.log('Duplicate page view tracking prevented:', eventId);
      return;
    }

    this.markEventAsTracked(eventId);

    // Track with client-side analytics service using the generated event ID
    analyticsService.trackPageView(pageTitle, pageUrl, eventId);

    // Also track with server-side Meta Pixel (if available) using the same event ID
    try {
      serverSideMetaPixelService.trackPageView(pageTitle, pageUrl, userData, eventId);
    } catch (e) {
      // Server-side tracking not available
    }
  }

  // Track product views (equivalent to PixelYourSite's ViewContent)
  trackProductView(productData: PixelYourSiteProductData, userData?: MetaPixelUserData): void {
    if (!this.trackingEnabled || !this.isInitialized) return;

    // Generate consistent event ID for both client and server
    const eventId = generateEventId('ViewContent', {product_id: productData.product_id, timestamp: Date.now()});

    // Prevent duplicate tracking
    if (this.isEventTracked(eventId)) {
      console.log('Duplicate product view tracking prevented:', eventId);
      return;
    }

    this.markEventAsTracked(eventId);

    // Track with client-side analytics service using the generated event ID
    analyticsService.trackProductView({
      product_id: productData.product_id,
      product_name: productData.product_name,
      product_category: productData.product_category,
      price: productData.product_price,
      currency: productData.currency,
      quantity: productData.quantity,
      value: productData.value,
    }, eventId);

    // Also track with server-side Meta Pixel (if available) using the same event ID
    try {
      serverSideMetaPixelService.trackProductView(productData, userData, eventId);
    } catch (e) {
      // Server-side tracking not available
    }
  }

  // Track add to cart (equivalent to PixelYourSite's AddToCart)
  trackAddToCart(productData: PixelYourSiteProductData, userData?: MetaPixelUserData): void {
    if (!this.trackingEnabled || !this.isInitialized) return;

    // Generate consistent event ID for both client and server
    const eventId = generateEventId('AddToCart', {product_id: productData.product_id, timestamp: Date.now()});

    // Prevent duplicate tracking
    if (this.isEventTracked(eventId)) {
      console.log('Duplicate add to cart tracking prevented:', eventId);
      return;
    }

    this.markEventAsTracked(eventId);

    // Track with client-side analytics service using the generated event ID
    analyticsService.trackAddToCart({
      product_id: productData.product_id,
      product_name: productData.product_name,
      product_category: productData.product_category,
      price: productData.product_price,
      currency: productData.currency,
      quantity: productData.quantity,
      value: productData.value,
    }, eventId);

    // Also track with server-side Meta Pixel (if available) using the same event ID
    try {
      serverSideMetaPixelService.trackAddToCart(productData, userData, eventId);
    } catch (e) {
      // Server-side tracking not available
    }
  }

  // Track cart contents (PixelYourSite's custom cart event)
  trackCart(cartData: PixelYourSiteCartData, userData?: MetaPixelUserData): void {
    if (!this.trackingEnabled || !this.isInitialized) return;

    // Generate consistent event ID for both client and server
    const eventId = generateEventId('InitiateCheckout', {value: cartData.value, contents: cartData.contents, timestamp: Date.now()});

    // Prevent duplicate tracking
    if (this.isEventTracked(eventId)) {
      console.log('Duplicate cart tracking prevented:', eventId);
      return;
    }

    this.markEventAsTracked(eventId);

    // Track InitiateCheckout if cart has items
    if (cartData.contents.length > 0) {
      analyticsService.trackCheckoutStart({
        value: cartData.value,
        currency: cartData.currency,
        contents: cartData.contents,
      }, eventId);

      // Also track with server-side Meta Pixel (if available) using the same event ID
      try {
        serverSideMetaPixelService.trackCheckoutStart({
          value: cartData.value,
          currency: cartData.currency,
          contents: cartData.contents,
        }, userData, eventId);
      } catch (e) {
        // Server-side tracking not available
      }
    }
  }

  // Track checkout start (equivalent to PixelYourSite's InitiateCheckout)
  trackCheckoutStart(checkoutData: PixelYourSiteCheckoutData, userData?: MetaPixelUserData): void {
    if (!this.trackingEnabled || !this.isInitialized) return;

    // Generate consistent event ID for both client and server
    const eventId = generateEventId('InitiateCheckout', {value: checkoutData.value, contents: checkoutData.contents, timestamp: Date.now()});

    // Prevent duplicate tracking
    if (this.isEventTracked(eventId)) {
      console.log('Duplicate checkout start tracking prevented:', eventId);
      return;
    }

    this.markEventAsTracked(eventId);

    // Track with client-side analytics service using the generated event ID
    analyticsService.trackCheckoutStart({
      value: checkoutData.value,
      currency: checkoutData.currency,
      contents: checkoutData.contents,
    }, eventId);

    // Also track with server-side Meta Pixel (if available) using the same event ID
    try {
      serverSideMetaPixelService.trackCheckoutStart(checkoutData, userData, eventId);
    } catch (e) {
      // Server-side tracking not available
    }
  }

  // Track purchase (equivalent to PixelYourSite's Purchase)
  trackPurchase(checkoutData: PixelYourSiteCheckoutData, userData?: MetaPixelUserData): void {
    if (!this.trackingEnabled || !this.isInitialized) return;

    // Generate a unique event ID based on the purchase content to identify actual purchase
    // This allows real duplicates to be tracked while preventing accidental multiple sends of the same data
    const uniquePurchaseKey = `purchase_${checkoutData.order_id || 'no_order_id'}_${checkoutData.value}_${JSON.stringify(checkoutData.contents.map(c => c.id).sort())}`;
    const eventId = generateEventId('Purchase', {order_id: checkoutData.order_id, value: checkoutData.value, uniquePurchaseKey});

    // Prevent duplicate tracking of the exact same purchase
    if (this.isEventTracked(eventId)) {
      console.log('Duplicate purchase tracking prevented:', eventId);
      return;
    }

    this.markEventAsTracked(eventId);

    // Track with client-side analytics service using the generated event ID
    analyticsService.trackPurchase({
      value: checkoutData.value,
      currency: checkoutData.currency,
      contents: checkoutData.contents,
    }, checkoutData.order_id, eventId);

    // Also track with server-side Meta Pixel (if available) using the same event ID
    if (checkoutData.order_id) {
      try {
        serverSideMetaPixelService.trackPurchase(
          checkoutData.order_id,
          checkoutData.value,
          checkoutData.currency,
          checkoutData.contents,
          userData,
          eventId
        );
      } catch (e) {
        // Server-side tracking not available
      }
    }
  }

  // Track search (PixelYourSite also tracks search events)
  trackSearch(searchTerm: string, resultsCount?: number, userData?: MetaPixelUserData): void {
    if (!this.trackingEnabled || !this.isInitialized) return;

    // Generate consistent event ID for both client and server
    const eventId = generateEventId('Search', {search_term: searchTerm, resultsCount, timestamp: Date.now()});

    // Prevent duplicate tracking
    if (this.isEventTracked(eventId)) {
      console.log('Duplicate search tracking prevented:', eventId);
      return;
    }

    this.markEventAsTracked(eventId);

    // Track with client-side analytics service
    analyticsService.trackEvent({
      eventName: 'search',
      parameters: {
        search_term: searchTerm,
        ...(resultsCount !== undefined && { search_results: resultsCount }),
        mp_event_id: eventId
      },
    });

    // Also track with server-side Meta Pixel (if available) using the same event ID
    try {
      serverSideMetaPixelService.trackSearch(searchTerm, resultsCount, userData, eventId);
    } catch (e) {
      // Server-side tracking not available
    }
  }

  // Track lead generation (for contact forms, etc.)
  trackLead(formData: any, userData?: MetaPixelUserData): void {
    if (!this.trackingEnabled || !this.isInitialized) return;

    // Generate consistent event ID for both client and server
    const eventId = generateEventId('Lead', {...formData, timestamp: Date.now()});

    // Prevent duplicate tracking
    if (this.isEventTracked(eventId)) {
      console.log('Duplicate lead tracking prevented:', eventId);
      return;
    }

    this.markEventAsTracked(eventId);

    // Track with client-side analytics service
    analyticsService.trackEvent({
      eventName: 'lead',
      parameters: {
        ...formData,
        mp_event_id: eventId
      },
    });

    // Also track with server-side Meta Pixel (if available) using the same event ID
    try {
      serverSideMetaPixelService.trackLead(formData, userData, eventId);
    } catch (e) {
      // Server-side tracking not available
    }
  }

  // Track custom events (PixelYourSite allows custom events)
  trackCustomEvent(eventName: string, parameters?: Record<string, any>, userData?: MetaPixelUserData): void {
    if (!this.trackingEnabled || !this.isInitialized) return;

    // Generate consistent event ID for both client and server
    const eventId = generateEventId(eventName, {...parameters, timestamp: Date.now()});

    // Prevent duplicate tracking
    if (this.isEventTracked(eventId)) {
      console.log(`Duplicate custom event '${eventName}' tracking prevented:`, eventId);
      return;
    }

    this.markEventAsTracked(eventId);

    // Track with client-side analytics service
    analyticsService.trackEvent({
      eventName,
      parameters: {
        ...parameters,
        mp_event_id: eventId
      },
    });

    // Also track with server-side Meta Pixel (if available) using the same event ID
    try {
      serverSideMetaPixelService.trackEvent({
        event_name: eventName,
        event_id: eventId,
        custom_data: parameters,
        user_data: userData,
      });
    } catch (e) {
      // Server-side tracking not available
    }
  }

  // Enhanced e-commerce tracking methods that PixelYourSite supports

  // Track product list view (when viewing a list of products)
  trackProductListView(category?: string, products?: PixelYourSiteProductData[], userData?: MetaPixelUserData): void {
    if (!this.trackingEnabled || !this.isInitialized) return;

    // Generate consistent event ID for both client and server
    const eventId = generateEventId('ViewItemList', {category, product_count: products?.length || 0, timestamp: Date.now()});

    // Prevent duplicate tracking
    if (this.isEventTracked(eventId)) {
      console.log('Duplicate product list view tracking prevented:', eventId);
      return;
    }

    this.markEventAsTracked(eventId);

    // Track with client-side analytics service
    analyticsService.trackEvent({
      eventName: 'view_item_list',
      parameters: {
        item_list_name: category || 'General Product List',
        items: products?.map(product => ({
          item_id: product.product_id,
          item_name: product.product_name,
          item_category: product.product_category,
          price: product.product_price,
        })) || [],
        mp_event_id: eventId
      },
    });

    // For server-side, we'll track as a custom event or ViewContent if single product
    if (products && products.length === 1) {
      try {
        serverSideMetaPixelService.trackProductView(products[0], userData, eventId);
      } catch (e) {
        // Server-side tracking not available
      }
    }
  }

  // Track product clicks (when clicking on a product in a list)
  trackProductClick(productData: PixelYourSiteProductData, listName?: string, userData?: MetaPixelUserData): void {
    if (!this.trackingEnabled || !this.isInitialized) return;

    // Generate consistent event ID for both client and server
    const eventId = generateEventId('SelectItem', {product_id: productData.product_id, listName});

    // Track with client-side analytics service
    analyticsService.trackEvent({
      eventName: 'select_item',
      parameters: {
        item_list_name: listName || 'General Product List',
        items: [{
          item_id: productData.product_id,
          item_name: productData.product_name,
          item_category: productData.product_category,
          price: productData.product_price,
        }],
        mp_event_id: eventId
      },
    });
    
    // For server-side, log as ViewContent since there's no direct equivalent
    try {
      serverSideMetaPixelService.trackProductView(productData, userData, eventId);
    } catch (e) {
      // Server-side tracking not available
    }
  }

  // Track checkout progress (PixelYourSite tracks at different checkout steps)
  trackCheckoutProgress(step: number, checkoutData: PixelYourSiteCheckoutData, userData?: MetaPixelUserData): void {
    if (!this.trackingEnabled || !this.isInitialized) return;

    // Generate consistent event ID for both client and server
    const eventId = generateEventId('CheckoutProgress', {step, value: checkoutData.value});

    // Track with client-side analytics service
    analyticsService.trackEvent({
      eventName: 'checkout_progress',
      parameters: {
        checkout_step: step,
        ...checkoutData,
        mp_event_id: eventId
      },
    });
    
    // For server-side, we'll track as InitiateCheckout at step 1, AddPaymentInfo at payment step, etc.
    try {
      if (step === 1) {
        serverSideMetaPixelService.trackCheckoutStart(checkoutData, userData, eventId);
      } else if (step === 3) { // Assuming step 3 is payment info
        serverSideMetaPixelService.trackAddPaymentInfo(checkoutData, userData, eventId);
      }
    } catch (e) {
      // Server-side tracking not available
    }
  }

  // Track payment info (when payment details are entered)
  trackPaymentInfo(checkoutData: PixelYourSiteCheckoutData, userData?: MetaPixelUserData): void {
    if (!this.trackingEnabled || !this.isInitialized) return;

    // Generate consistent event ID for both client and server
    const eventId = generateEventId('AddPaymentInfo', {value: checkoutData.value, contents: checkoutData.contents});

    // Track with client-side analytics service
    analyticsService.trackEvent({
      eventName: 'add_payment_info',
      parameters: {
        ...checkoutData,
        mp_event_id: eventId
      },
    });
    
    // Also track with server-side Meta Pixel (if available) using the same event ID
    try {
      serverSideMetaPixelService.trackAddPaymentInfo(checkoutData, userData, eventId);
    } catch (e) {
      // Server-side tracking not available
    }
  }

  // Track shipping info (when shipping details are entered)
  trackShippingInfo(checkoutData: PixelYourSiteCheckoutData, userData?: MetaPixelUserData): void {
    if (!this.trackingEnabled || !this.isInitialized) return;

    // Generate consistent event ID for both client and server
    const eventId = generateEventId('AddShippingInfo', {value: checkoutData.value, contents: checkoutData.contents});

    // Track with client-side analytics service
    analyticsService.trackEvent({
      eventName: 'add_shipping_info',
      parameters: {
        ...checkoutData,
        mp_event_id: eventId
      },
    });
    
    // For server-side, we can track as a custom event
    try {
      serverSideMetaPixelService.trackEvent({
        event_name: 'AddShippingInfo',
        event_id: eventId,
        custom_data: checkoutData,
        user_data: userData
      });
    } catch (e) {
      // Server-side tracking not available
    }
  }

  // Track registration/sign up
  trackRegistration(method: string, userData?: MetaPixelUserData): void {
    if (!this.trackingEnabled || !this.isInitialized) return;

    // Generate consistent event ID for both client and server
    const eventId = generateEventId('CompleteRegistration', {method});

    // Track with client-side analytics service
    analyticsService.trackEvent({
      eventName: 'sign_up',
      parameters: {
        method: method,
        mp_event_id: eventId
      },
    });
    
    // Also track with server-side Meta Pixel using the same event ID
    try {
      serverSideMetaPixelService.trackRegistration(userData, method, eventId);
    } catch (e) {
      // Server-side tracking not available
    }
  }

  // Track login
  trackLogin(method: string, userData?: MetaPixelUserData): void {
    if (!this.trackingEnabled || !this.isInitialized) return;

    // Generate consistent event ID for both client and server
    const eventId = generateEventId('Login', {method});

    // Track with client-side analytics service
    analyticsService.trackEvent({
      eventName: 'login',
      parameters: {
        method: method,
        mp_event_id: eventId
      },
    });
    
    // For server-side, we'll track as a custom event since there's no direct login event
    try {
      serverSideMetaPixelService.trackEvent({
        event_name: 'CompleteRegistration',  // Using CompleteRegistration as closest equivalent to login
        event_id: eventId,
        custom_data: { method },
        user_data: userData
      });
    } catch (e) {
      // Server-side tracking not available
    }
  }

  // Get all available tracking providers
  getTrackingProviders(): string[] {
    return ['Google Analytics', 'Meta Pixel (Client)', 'Meta Pixel (Server)', 'TikTok Pixel'];
  }

  // Check if specific provider is active
  isProviderActive(provider: string): boolean {
    // This would check if the specific pixel is properly loaded
    switch(provider.toLowerCase()) {
      case 'google analytics':
        return typeof window.gtag !== 'undefined';
      case 'meta pixel (client)':
        return typeof window.fbq !== 'undefined';
      case 'meta pixel (server)':
        return true; // Server-side tracking is always available if the service is initialized
      case 'tikTok pixel':
        return typeof window.ttq !== 'undefined';
      default:
        return false;
    }
  }
}

// Create singleton instance
export const pixelYourSiteService = new PixelYourSiteService();

// Initialize the service when imported
pixelYourSiteService.initialize();

// Export types for use in other parts of the application
export type {
  PixelYourSiteProductData,
  PixelYourSiteCartData,
  PixelYourSiteCheckoutData,
  MetaPixelUserData
};
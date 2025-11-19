// services/pixelYourSiteService.ts
// PixelYourSite-compatible service for React application
// Provides the same tracking capabilities as the PixelYourSite WordPress plugin
// Now includes both client-side and server-side Meta Pixel tracking

import { analyticsService } from './analyticsService';
import { serverSideMetaPixelService } from './serverSideMetaPixelService';

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
  
  // Track page views (standard PixelYourSite event)
  trackPageView(pageTitle?: string, pageUrl?: string, userData?: MetaPixelUserData): void {
    if (!this.trackingEnabled || !this.isInitialized) return;
    
    // Track with client-side analytics service
    analyticsService.trackPageView(pageTitle, pageUrl);
    
    // Also track with server-side Meta Pixel
    try {
      serverSideMetaPixelService.trackPageView(pageTitle, pageUrl, userData);
    } catch (e) {
      console.error('Server-side Meta Pixel tracking failed for page view:', e);
    }
  }
  
  // Track product views (equivalent to PixelYourSite's ViewContent)
  trackProductView(productData: PixelYourSiteProductData, userData?: MetaPixelUserData): void {
    if (!this.trackingEnabled || !this.isInitialized) return;
    
    // Track with client-side analytics service
    analyticsService.trackProductView({
      product_id: productData.product_id,
      product_name: productData.product_name,
      product_category: productData.product_category,
      price: productData.product_price,
      currency: productData.currency,
      quantity: productData.quantity,
      value: productData.value,
    });
    
    // Also track with server-side Meta Pixel
    try {
      serverSideMetaPixelService.trackProductView(productData, userData);
    } catch (e) {
      console.error('Server-side Meta Pixel tracking failed for product view:', e);
    }
  }
  
  // Track add to cart (equivalent to PixelYourSite's AddToCart)
  trackAddToCart(productData: PixelYourSiteProductData, userData?: MetaPixelUserData): void {
    if (!this.trackingEnabled || !this.isInitialized) return;
    
    // Track with client-side analytics service
    analyticsService.trackAddToCart({
      product_id: productData.product_id,
      product_name: productData.product_name,
      product_category: productData.product_category,
      price: productData.product_price,
      currency: productData.currency,
      quantity: productData.quantity,
      value: productData.value,
    });
    
    // Also track with server-side Meta Pixel
    try {
      serverSideMetaPixelService.trackAddToCart(productData, userData);
    } catch (e) {
      console.error('Server-side Meta Pixel tracking failed for add to cart:', e);
    }
  }
  
  // Track cart contents (PixelYourSite's custom cart event)
  trackCart(cartData: PixelYourSiteCartData, userData?: MetaPixelUserData): void {
    if (!this.trackingEnabled || !this.isInitialized) return;
    
    // Track InitiateCheckout if cart has items
    if (cartData.contents.length > 0) {
      analyticsService.trackCheckoutStart({
        value: cartData.value,
        currency: cartData.currency,
        contents: cartData.contents,
      });
      
      // Also track with server-side Meta Pixel
      try {
        serverSideMetaPixelService.trackCheckoutStart({
          value: cartData.value,
          currency: cartData.currency,
          contents: cartData.contents,
        }, userData);
      } catch (e) {
        console.error('Server-side Meta Pixel tracking failed for cart:', e);
      }
    }
  }
  
  // Track checkout start (equivalent to PixelYourSite's InitiateCheckout)
  trackCheckoutStart(checkoutData: PixelYourSiteCheckoutData, userData?: MetaPixelUserData): void {
    if (!this.trackingEnabled || !this.isInitialized) return;
    
    // Track with client-side analytics service
    analyticsService.trackCheckoutStart({
      value: checkoutData.value,
      currency: checkoutData.currency,
      contents: checkoutData.contents,
    });
    
    // Also track with server-side Meta Pixel
    try {
      serverSideMetaPixelService.trackCheckoutStart(checkoutData, userData);
    } catch (e) {
      console.error('Server-side Meta Pixel tracking failed for checkout start:', e);
    }
  }
  
  // Track purchase (equivalent to PixelYourSite's Purchase)
  trackPurchase(checkoutData: PixelYourSiteCheckoutData, userData?: MetaPixelUserData): void {
    if (!this.trackingEnabled || !this.isInitialized) return;
    
    // Track with client-side analytics service
    analyticsService.trackPurchase({
      value: checkoutData.value,
      currency: checkoutData.currency,
      contents: checkoutData.contents,
    }, checkoutData.order_id);
    
    // Also track with server-side Meta Pixel
    if (checkoutData.order_id) {
      try {
        serverSideMetaPixelService.trackPurchase(
          checkoutData.order_id,
          checkoutData.value,
          checkoutData.currency,
          checkoutData.contents,
          userData
        );
      } catch (e) {
        console.error('Server-side Meta Pixel tracking failed for purchase:', e);
      }
    }
  }
  
  // Track search (PixelYourSite also tracks search events)
  trackSearch(searchTerm: string, resultsCount?: number, userData?: MetaPixelUserData): void {
    if (!this.trackingEnabled || !this.isInitialized) return;
    
    // Track with client-side analytics service
    analyticsService.trackEvent({
      eventName: 'search',
      parameters: {
        search_term: searchTerm,
        ...(resultsCount !== undefined && { search_results: resultsCount }),
      },
    });
    
    // Also track with server-side Meta Pixel
    try {
      serverSideMetaPixelService.trackSearch(searchTerm, resultsCount, userData);
    } catch (e) {
      console.error('Server-side Meta Pixel tracking failed for search:', e);
    }
  }
  
  // Track lead generation (for contact forms, etc.)
  trackLead(formData: any, userData?: MetaPixelUserData): void {
    if (!this.trackingEnabled || !this.isInitialized) return;
    
    // Track with client-side analytics service
    analyticsService.trackEvent({
      eventName: 'lead',
      parameters: { ...formData },
    });
    
    // Also track with server-side Meta Pixel
    try {
      serverSideMetaPixelService.trackLead(formData, userData);
    } catch (e) {
      console.error('Server-side Meta Pixel tracking failed for lead:', e);
    }
  }
  
  // Track custom events (PixelYourSite allows custom events)
  trackCustomEvent(eventName: string, parameters?: Record<string, any>, userData?: MetaPixelUserData): void {
    if (!this.trackingEnabled || !this.isInitialized) return;

    // Track with client-side analytics service
    analyticsService.trackEvent({
      eventName,
      parameters,
    });

    // Also track with server-side Meta Pixel
    try {
      serverSideMetaPixelService.trackEvent({
        event_name: eventName,
        custom_data: parameters,
        user_data: userData,
      });
    } catch (e) {
      console.error(`Server-side Meta Pixel tracking failed for custom event ${eventName}:`, e);
    }
  }
  
  // Enhanced e-commerce tracking methods that PixelYourSite supports
  
  // Track product list view (when viewing a list of products)
  trackProductListView(category?: string, products?: PixelYourSiteProductData[], userData?: MetaPixelUserData): void {
    if (!this.trackingEnabled || !this.isInitialized) return;
    
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
      },
    });
    
    // For server-side, we'll track as a custom event or ViewContent if single product
    if (products && products.length === 1) {
      try {
        serverSideMetaPixelService.trackProductView(products[0], userData);
      } catch (e) {
        console.error('Server-side Meta Pixel tracking failed for product list view:', e);
      }
    }
  }
  
  // Track product clicks (when clicking on a product in a list)
  trackProductClick(productData: PixelYourSiteProductData, listName?: string, userData?: MetaPixelUserData): void {
    if (!this.trackingEnabled || !this.isInitialized) return;
    
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
      },
    });
    
    // For server-side, log as ViewContent since there's no direct equivalent
    try {
      serverSideMetaPixelService.trackProductView(productData, userData);
    } catch (e) {
      console.error('Server-side Meta Pixel tracking failed for product click:', e);
    }
  }
  
  // Track checkout progress (PixelYourSite tracks at different checkout steps)
  trackCheckoutProgress(step: number, checkoutData: PixelYourSiteCheckoutData, userData?: MetaPixelUserData): void {
    if (!this.trackingEnabled || !this.isInitialized) return;
    
    // Track with client-side analytics service
    analyticsService.trackEvent({
      eventName: 'checkout_progress',
      parameters: {
        checkout_step: step,
        ...checkoutData,
      },
    });
    
    // For server-side, we'll track as InitiateCheckout at step 1, AddPaymentInfo at payment step, etc.
    try {
      if (step === 1) {
        serverSideMetaPixelService.trackCheckoutStart(checkoutData, userData);
      } else if (step === 3) { // Assuming step 3 is payment info
        serverSideMetaPixelService.trackAddPaymentInfo(checkoutData, userData);
      }
    } catch (e) {
      console.error('Server-side Meta Pixel tracking failed for checkout progress:', e);
    }
  }
  
  // Track payment info (when payment details are entered)
  trackPaymentInfo(checkoutData: PixelYourSiteCheckoutData, userData?: MetaPixelUserData): void {
    if (!this.trackingEnabled || !this.isInitialized) return;
    
    // Track with client-side analytics service
    analyticsService.trackEvent({
      eventName: 'add_payment_info',
      parameters: {
        ...checkoutData,
      },
    });
    
    // Also track with server-side Meta Pixel
    try {
      serverSideMetaPixelService.trackAddPaymentInfo(checkoutData, userData);
    } catch (e) {
      console.error('Server-side Meta Pixel tracking failed for payment info:', e);
    }
  }
  
  // Track shipping info (when shipping details are entered)
  trackShippingInfo(checkoutData: PixelYourSiteCheckoutData, userData?: MetaPixelUserData): void {
    if (!this.trackingEnabled || !this.isInitialized) return;
    
    // Track with client-side analytics service
    analyticsService.trackEvent({
      eventName: 'add_shipping_info',
      parameters: {
        ...checkoutData,
      },
    });
    
    // For server-side, we can track as a custom event
    try {
      serverSideMetaPixelService.trackCustomEvent('AddShippingInfo', checkoutData, userData);
    } catch (e) {
      console.error('Server-side Meta Pixel tracking failed for shipping info:', e);
    }
  }
  
  // Track registration/sign up
  trackRegistration(method: string, userData?: MetaPixelUserData): void {
    if (!this.trackingEnabled || !this.isInitialized) return;
    
    // Track with client-side analytics service
    analyticsService.trackEvent({
      eventName: 'sign_up',
      parameters: {
        method: method,
      },
    });
    
    // Also track with server-side Meta Pixel
    try {
      serverSideMetaPixelService.trackRegistration(userData, method);
    } catch (e) {
      console.error('Server-side Meta Pixel tracking failed for registration:', e);
    }
  }
  
  // Track login
  trackLogin(method: string, userData?: MetaPixelUserData): void {
    if (!this.trackingEnabled || !this.isInitialized) return;
    
    // Track with client-side analytics service
    analyticsService.trackEvent({
      eventName: 'login',
      parameters: {
        method: method,
      },
    });
    
    // For server-side, we'll track as a custom event since there's no direct login event
    try {
      serverSideMetaPixelService.trackCustomEvent('Login', { method }, userData);
    } catch (e) {
      console.error('Server-side Meta Pixel tracking failed for login:', e);
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
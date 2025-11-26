// services/pixelYourSiteService.ts
// PixelYourSite-compatible service for React application
// Provides the same tracking capabilities as the PixelYourSite WordPress plugin
// Now includes server-side Meta Pixel tracking with test event support

import { serverSideMetaPixelService } from './serverSideMetaPixelService';

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
    // PixelYourSite tracking is ready
    this.isInitialized = true;

    // Track page view when PixelYourSite is initialized
    this.trackPageView();
  }

  // Enable/disable tracking
  setTrackingEnabled(enabled: boolean): void {
    this.trackingEnabled = enabled;
  }

  // Track page views (standard PixelYourSite event)
  trackPageView(pageTitle?: string, pageUrl?: string, userData?: MetaPixelUserData): void {
    if (!this.trackingEnabled || !this.isInitialized) return;

    // Track with server-side Meta Pixel for enhanced reliability
    if (typeof window !== 'undefined' && window.location) {
      serverSideMetaPixelService.trackPageView(pageTitle, pageUrl, userData);
    }
  }

  // Track product views (equivalent to PixelYourSite's ViewContent)
  trackProductView(productData: PixelYourSiteProductData, userData?: MetaPixelUserData): void {
    if (!this.trackingEnabled || !this.isInitialized) return;

    // Track with server-side Meta Pixel for enhanced reliability
    serverSideMetaPixelService.trackProductView(productData, userData);
  }

  // Track add to cart (equivalent to PixelYourSite's AddToCart)
  trackAddToCart(productData: PixelYourSiteProductData, userData?: MetaPixelUserData): void {
    if (!this.trackingEnabled || !this.isInitialized) return;

    // Track with server-side Meta Pixel for enhanced reliability
    serverSideMetaPixelService.trackAddToCart(productData, userData);
  }

  // Track cart contents (PixelYourSite's custom cart event)
  trackCart(cartData: PixelYourSiteCartData, userData?: MetaPixelUserData): void {
    if (!this.trackingEnabled || !this.isInitialized) return;

    // Track InitiateCheckout if cart has items
    if (cartData.contents.length > 0) {
      // Also track with server-side Meta Pixel
      serverSideMetaPixelService.trackCheckoutStart({
        value: cartData.value,
        currency: cartData.currency,
        contents: cartData.contents,
      }, userData);
    }
  }

  // Track checkout start (equivalent to PixelYourSite's InitiateCheckout)
  trackCheckoutStart(checkoutData: PixelYourSiteCheckoutData, userData?: MetaPixelUserData): void {
    if (!this.trackingEnabled || !this.isInitialized) return;

    // Track with server-side Meta Pixel for enhanced reliability
    serverSideMetaPixelService.trackCheckoutStart(checkoutData, userData);
  }

  // Track purchase (equivalent to PixelYourSite's Purchase)
  trackPurchase(checkoutData: PixelYourSiteCheckoutData, userData?: MetaPixelUserData): void {
    if (!this.trackingEnabled || !this.isInitialized) return;

    // Also track with server-side Meta Pixel for enhanced reliability
    if (checkoutData.order_id) {
      serverSideMetaPixelService.trackPurchase(
        checkoutData.order_id,
        checkoutData.value,
        checkoutData.currency,
        checkoutData.contents,
        userData
      );
    }
  }

  // Track search (PixelYourSite also tracks search events)
  trackSearch(searchTerm: string, resultsCount?: number, userData?: MetaPixelUserData): void {
    if (!this.trackingEnabled || !this.isInitialized) return;

    // Track with server-side Meta Pixel for enhanced reliability
    serverSideMetaPixelService.trackSearch(searchTerm, resultsCount, userData);
  }

  // Track lead generation (for contact forms, etc.)
  trackLead(formData: any, userData?: MetaPixelUserData): void {
    if (!this.trackingEnabled || !this.isInitialized) return;

    // Track with server-side Meta Pixel for enhanced reliability
    serverSideMetaPixelService.trackLead(formData, userData);
  }

  // Track custom events (PixelYourSite allows custom events)
  trackCustomEvent(eventName: string, parameters?: Record<string, any>, userData?: MetaPixelUserData): void {
    if (!this.trackingEnabled || !this.isInitialized) return;

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
      serverSideMetaPixelService.trackProductView(products[0], userData);
    }
  }

  // Track product clicks (when clicking on a product in a list)
  trackProductClick(productData: PixelYourSiteProductData, _listName: string | undefined, userData?: MetaPixelUserData): void {
    if (!this.trackingEnabled || !this.isInitialized) return;

    // For server-side, log as ViewContent since there's no direct equivalent
    serverSideMetaPixelService.trackProductView(productData, userData);
  }

  // Track checkout progress (PixelYourSite tracks at different checkout steps)
  trackCheckoutProgress(step: number, checkoutData: PixelYourSiteCheckoutData, userData?: MetaPixelUserData): void {
    if (!this.trackingEnabled || !this.isInitialized) return;

    // For server-side, we'll track as InitiateCheckout at step 1, AddPaymentInfo at payment step, etc.
    if (step === 1) {
      serverSideMetaPixelService.trackCheckoutStart(checkoutData, userData);
    } else if (step === 3) { // Assuming step 3 is payment info
      serverSideMetaPixelService.trackAddPaymentInfo(checkoutData, userData);
    }
  }

  // Track payment info (when payment details are entered)
  trackPaymentInfo(checkoutData: PixelYourSiteCheckoutData, userData?: MetaPixelUserData): void {
    if (!this.trackingEnabled || !this.isInitialized) return;

    // Also track with server-side Meta Pixel
    serverSideMetaPixelService.trackAddPaymentInfo(checkoutData, userData);
  }

  // Track shipping info (when shipping details are entered)
  trackShippingInfo(checkoutData: PixelYourSiteCheckoutData, userData?: MetaPixelUserData): void {
    if (!this.trackingEnabled || !this.isInitialized) return;

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

    // Also track with server-side Meta Pixel for enhanced reliability
    serverSideMetaPixelService.trackRegistration(userData, method);
  }

  // Track login
  trackLogin(method: string, userData?: MetaPixelUserData): void {
    if (!this.trackingEnabled || !this.isInitialized) return;

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
    return ['Meta Pixel (Server)'];
  }

  // Check if specific provider is active
  isProviderActive(provider: string): boolean {
    // This would check if the specific pixel is properly loaded
    if (typeof window === 'undefined') return false;

    switch(provider.toLowerCase()) {
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

// Export types for use in other parts of the application
// (Note: Types are already exported above)
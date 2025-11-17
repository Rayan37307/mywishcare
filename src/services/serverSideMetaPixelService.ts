// services/serverSideMetaPixelService.ts
// Server-side Meta Pixel tracking service for React application
// Works in conjunction with existing client-side tracking

import type { PixelYourSiteProductData, PixelYourSiteCheckoutData } from './pixelYourSiteService';

// Define types for server-side Meta Pixel tracking
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

interface MetaPixelCustomData {
  currency?: string;
  value?: number;
  contents?: Array<{
    id: string | number;
    quantity: number;
    item_price?: number;
  }>;
  [key: string]: any; // Allow additional custom properties
}

interface MetaPixelTrackingEvent {
  event_name: string;
  event_id?: string;
  user_data?: MetaPixelUserData;
  custom_data?: MetaPixelCustomData;
}

class ServerSideMetaPixelService {
  private pixelId: string | null = null;
  private isInitialized = false;
  private trackingEnabled = true;
  private apiBaseUrl: string;
  
  constructor() {
    // Get API base URL from environment variables
    this.apiBaseUrl = import.meta.env.VITE_WP_API_URL || 'https://wishcarebd.com/wp-json';
  }
  
  // Initialize the service with Meta Pixel ID
  initialize(pixelId?: string): void {
    const configuredPixelId = pixelId || import.meta.env.VITE_FACEBOOK_PIXEL_ID;
    
    if (configuredPixelId) {
      this.pixelId = configuredPixelId;
      this.isInitialized = true;
    } else {
      console.warn('ServerSideMetaPixelService: No Meta Pixel ID provided');
    }
  }
  
  // Enable/disable tracking
  setTrackingEnabled(enabled: boolean): void {
    this.trackingEnabled = enabled;
  }
  
  // Track a generic event server-side
  async trackEvent(event: MetaPixelTrackingEvent): Promise<boolean> {
    if (!this.trackingEnabled || !this.isInitialized || !this.pixelId) {
      return false;
    }

    try {
      // Create a unique event ID if not provided
      const eventId = event.event_id || `ss_${event.event_name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const response = await fetch(`${this.apiBaseUrl}/meta-pixel/v1/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...event,
          event_id: eventId,
          user_data: {
            ...event.user_data,
            // Additional data can be collected here
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Server-side Meta Pixel tracking failed:', errorData);
        return false;
      }

      const result = await response.json();
      console.log('Server-side Meta Pixel event tracked:', result);
      return true;
    } catch (error) {
      console.error('Error tracking server-side Meta Pixel event:', error);
      return false;
    }
  }
  
  // Track purchase event server-side
  async trackPurchase(orderId: string, value: number, currency: string, 
                      contents: MetaPixelCustomData['contents'], 
                      userData?: MetaPixelUserData): Promise<boolean> {
    if (!this.trackingEnabled || !this.isInitialized || !this.pixelId) {
      return false;
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/meta-pixel/v1/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: orderId,
          value,
          currency,
          contents,
          user_data: userData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Server-side Meta Pixel purchase tracking failed:', errorData);
        return false;
      }

      const result = await response.json();
      console.log('Server-side Meta Pixel purchase tracked:', result);
      return true;
    } catch (error) {
      console.error('Error tracking server-side Meta Pixel purchase:', error);
      return false;
    }
  }
  
  // Track page view server-side
  async trackPageView(pageTitle?: string, pageUrl?: string, userData?: MetaPixelUserData): Promise<boolean> {
    return this.trackEvent({
      event_name: 'PageView',
      user_data: userData,
      custom_data: {
        page_title: pageTitle,
        page_url: pageUrl,
      }
    });
  }
  
  // Track product view server-side
  async trackProductView(productData: PixelYourSiteProductData, userData?: MetaPixelUserData): Promise<boolean> {
    return this.trackEvent({
      event_name: 'ViewContent',
      user_data: userData,
      custom_data: {
        content_ids: [productData.product_id],
        content_name: productData.product_name,
        content_type: 'product',
        value: productData.value,
        currency: productData.currency,
      }
    });
  }
  
  // Track add to cart server-side
  async trackAddToCart(productData: PixelYourSiteProductData, userData?: MetaPixelUserData): Promise<boolean> {
    return this.trackEvent({
      event_name: 'AddToCart',
      user_data: userData,
      custom_data: {
        content_ids: [productData.product_id],
        content_name: productData.product_name,
        content_type: 'product',
        value: productData.value,
        currency: productData.currency,
      }
    });
  }
  
  // Track checkout start server-side
  async trackCheckoutStart(checkoutData: PixelYourSiteCheckoutData, userData?: MetaPixelUserData): Promise<boolean> {
    return this.trackEvent({
      event_name: 'InitiateCheckout',
      user_data: userData,
      custom_data: {
        contents: checkoutData.contents,
        value: checkoutData.value,
        currency: checkoutData.currency,
      }
    });
  }
  
  // Track lead generation server-side
  async trackLead(formData: any, userData?: MetaPixelUserData): Promise<boolean> {
    return this.trackEvent({
      event_name: 'Lead',
      user_data: userData,
      custom_data: formData,
    });
  }
  
  // Track complete registration server-side
  async trackRegistration(userData?: MetaPixelUserData, method: string = 'default'): Promise<boolean> {
    return this.trackEvent({
      event_name: 'CompleteRegistration',
      user_data: userData,
      custom_data: {
        method,
      }
    });
  }
  
  // Enhanced e-commerce tracking methods
  
  // Track search server-side
  async trackSearch(searchTerm: string, resultsCount?: number, userData?: MetaPixelUserData): Promise<boolean> {
    return this.trackEvent({
      event_name: 'Search',
      user_data: userData,
      custom_data: {
        search_string: searchTerm,
        search_results: resultsCount,
      }
    });
  }
  
  // Track add payment info server-side
  async trackAddPaymentInfo(checkoutData: PixelYourSiteCheckoutData, userData?: MetaPixelUserData): Promise<boolean> {
    return this.trackEvent({
      event_name: 'AddPaymentInfo',
      user_data: userData,
      custom_data: {
        contents: checkoutData.contents,
        value: checkoutData.value,
        currency: checkoutData.currency,
      }
    });
  }
}

// Create singleton instance
export const serverSideMetaPixelService = new ServerSideMetaPixelService();

// Initialize the service when imported
serverSideMetaPixelService.initialize();

// Export for use in other parts of the application
export type { 
  MetaPixelUserData, 
  MetaPixelCustomData, 
  MetaPixelTrackingEvent 
};

// Export the class for potential direct use
export { ServerSideMetaPixelService };
// services/serverSideMetaPixelService.ts
// Server-side Meta Pixel tracking service for React application
// This service sends events to your WordPress site which then forwards them to Meta

import type {
  PixelYourSiteProductData,
  PixelYourSiteCheckoutData,
  MetaPixelUserData
} from './pixelYourSiteService';

interface ServerSideEventParams {
  event_name: string;
  user_data?: MetaPixelUserData;
  custom_data?: Record<string, any>;
  event_id?: string;
}

class ServerSideMetaPixelService {
  private readonly apiUrl: string;
  private readonly timeout = 5000; // 5 seconds timeout
  private readonly testEventCode: string | null;

  constructor() {
    this.apiUrl = import.meta.env.VITE_WP_API_URL || 'https://wishcarebd.com/wp-json';
    this.testEventCode = import.meta.env.VITE_FACEBOOK_TEST_EVENT_CODE || "TEST11525";
  }

  // Track general events server-side
  async trackEvent(params: ServerSideEventParams): Promise<void> {
    if (!this.apiUrl) {
      console.warn('Server-side Meta Pixel: WordPress API URL not configured');
      return;
    }

    // Build the event parameters with the correct structure
    const eventParams: any = {
      event_name: params.event_name,
      event_id: params.event_id || this.generateEventId(),
      user_data: params.user_data || {},
      custom_data: params.custom_data || {},
    };

    // Ensure we have at least one of user_data or custom_data to satisfy the server validation
    if (Object.keys(eventParams.user_data).length === 0 && Object.keys(eventParams.custom_data).length === 0) {
      // If both are empty, add a minimal custom_data to satisfy the server
      eventParams.custom_data = { event_type: params.event_name };
    }

    // Add test event code to the payload if available
    if (this.testEventCode) {
      eventParams.test_event_code = this.testEventCode;
    }

    try {
      const response = await fetch(`${this.apiUrl}/meta-pixel/v1/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventParams),
        signal: AbortSignal.timeout(this.timeout),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP ${response.status}: ${JSON.stringify(errorData)}`);
      }

      const result = await response.json();
      console.log('Server-side Meta Pixel event tracked successfully:', result);
    } catch (error) {
      console.error('Server-side Meta Pixel tracking failed:', error);
      throw error;
    }
  }

  // Track page view server-side
  async trackPageView(pageTitle?: string, pageUrl?: string, userData?: MetaPixelUserData): Promise<void> {
    await this.trackEvent({
      event_name: 'PageView',
      user_data: userData || {},
      custom_data: {
        page_title: pageTitle || '',
        page_url: pageUrl || window.location.href,
      },
      event_id: this.generateEventId(),
    });
  }

  // Track product view server-side
  async trackProductView(productData: PixelYourSiteProductData, userData?: MetaPixelUserData): Promise<void> {
    await this.trackEvent({
      event_name: 'ViewContent',
      user_data: userData || {},
      custom_data: {
        content_ids: [productData.product_id],
        content_name: productData.product_name,
        content_type: productData.content_type || 'product',
        value: productData.value,
        currency: productData.currency,
      },
      event_id: this.generateEventId(),
    });
  }

  // Track add to cart server-side
  async trackAddToCart(productData: PixelYourSiteProductData, userData?: MetaPixelUserData): Promise<void> {
    await this.trackEvent({
      event_name: 'AddToCart',
      user_data: userData || {},
      custom_data: {
        content_ids: [productData.product_id],
        content_name: productData.product_name,
        content_type: productData.content_type || 'product',
        value: productData.value,
        currency: productData.currency,
      },
      event_id: this.generateEventId(),
    });
  }

  // Track checkout start server-side
  async trackCheckoutStart(checkoutData: PixelYourSiteCheckoutData, userData?: MetaPixelUserData): Promise<void> {
    await this.trackEvent({
      event_name: 'InitiateCheckout',
      user_data: userData || {},
      custom_data: {
        contents: checkoutData.contents,
        value: checkoutData.value,
        currency: checkoutData.currency,
      },
      event_id: this.generateEventId(),
    });
  }

  // Track purchase server-side
  async trackPurchase(
    orderId: string,
    value: number,
    currency: string,
    contents: Array<{
      id: string | number;
      quantity: number;
      item_price?: number;
    }>,
    userData?: MetaPixelUserData
  ): Promise<void> {
    try {
      if (!this.apiUrl) {
        console.warn('Server-side Meta Pixel: WordPress API URL not configured');
        return;
      }

      // Build the purchase data with correct structure
      const purchaseData: any = {
        order_id: orderId,
        value,
        currency,
        contents,
        user_data: userData || {},
      };

      // Add test event code to purchase data if available
      if (this.testEventCode) {
        purchaseData.test_event_code = this.testEventCode;
      }

      const response = await fetch(`${this.apiUrl}/meta-pixel/v1/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(purchaseData),
        signal: AbortSignal.timeout(this.timeout),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP ${response.status}: ${JSON.stringify(errorData)}`);
      }

      const result = await response.json();
      console.log('Server-side Meta Pixel purchase tracked successfully:', result);
    } catch (error) {
      console.error('Server-side Meta Pixel purchase tracking failed:', error);
      throw error;
    }
  }

  // Track search server-side
  async trackSearch(searchTerm: string, resultsCount?: number, userData?: MetaPixelUserData): Promise<void> {
    await this.trackEvent({
      event_name: 'Search',
      user_data: userData || {},
      custom_data: {
        search_string: searchTerm,
        ...(resultsCount !== undefined && { search_results: resultsCount }),
      },
      event_id: this.generateEventId(),
    });
  }

  // Track lead generation server-side
  async trackLead(formData: any, userData?: MetaPixelUserData): Promise<void> {
    await this.trackEvent({
      event_name: 'Lead',
      user_data: userData || {},
      custom_data: formData || {},
      event_id: this.generateEventId(),
    });
  }

  // Track registration server-side
  async trackRegistration(userData?: MetaPixelUserData, method?: string): Promise<void> {
    await this.trackEvent({
      event_name: 'CompleteRegistration',
      user_data: userData || {},
      custom_data: {
        registration_method: method || 'default',
      },
      event_id: this.generateEventId(),
    });
  }

  // Track payment info added server-side
  async trackAddPaymentInfo(checkoutData: PixelYourSiteCheckoutData, userData?: MetaPixelUserData): Promise<void> {
    await this.trackEvent({
      event_name: 'AddPaymentInfo',
      user_data: userData || {},
      custom_data: {
        contents: checkoutData.contents,
        value: checkoutData.value,
        currency: checkoutData.currency,
      },
      event_id: this.generateEventId(),
    });
  }

  // Generate unique event ID
  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Create singleton instance
export const serverSideMetaPixelService = new ServerSideMetaPixelService();
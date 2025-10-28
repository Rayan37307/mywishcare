// services/analyticsService.ts
// Analytics service for tracking platform integrations (Meta, TikTok, and Google)

// Types for analytics events
export interface AnalyticsEvent {
  eventName: string;
  parameters?: Record<string, any>;
  userId?: string;
  sessionId?: string;
}

// Types for tracking data
export interface ProductTrackingData {
  product_id: string | number;
  product_name: string;
  product_category?: string;
  price?: number;
  currency?: string;
  quantity?: number;
  value?: number;
}

export interface CheckoutTrackingData {
  value: number;
  currency: string;
  contents: Array<{
    id: string | number;
    quantity: number;
    item_price?: number;
  }>;
  content_type?: string;
}

// Main analytics service class
class AnalyticsService {
  private isInitialized = false;
  private trackingEnabled = true;
  
  // Initialize all tracking platforms
  initialize(): void {
    this.loadGoogleAnalytics();
    this.loadMetaPixel();
    this.loadTikTokPixel();
    this.isInitialized = true;
  }
  
  // Enable/disable tracking
  setTrackingEnabled(enabled: boolean): void {
    this.trackingEnabled = enabled;
  }
  
  // Track generic events
  trackEvent(event: AnalyticsEvent): void {
    if (!this.trackingEnabled || !this.isInitialized) return;
    
    // Send to all platforms
    this.trackOnGoogle(event);
    this.trackOnMeta(event);
    this.trackOnTikTok(event);
  }
  
  // Track page views
  trackPageView(pageTitle?: string, pageUrl?: string): void {
    if (!this.trackingEnabled || !this.isInitialized) return;
    
    // Google Analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'page_view', {
        page_title: pageTitle,
        page_location: pageUrl,
      });
    }
    
    // Meta Pixel
    if (typeof fbq !== 'undefined') {
      fbq('track', 'PageView');
    }
    
    // TikTok Pixel
    if (typeof ttq !== 'undefined') {
      ttq.track('PageView');
    }
  }
  
  // Track product views
  trackProductView(productData: ProductTrackingData): void {
    if (!this.trackingEnabled || !this.isInitialized) return;
    
    // Google Analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'view_item', {
        items: [{
          item_id: productData.product_id,
          item_name: productData.product_name,
          item_category: productData.product_category,
          price: productData.price,
          quantity: productData.quantity,
        }],
        value: productData.value,
        currency: productData.currency,
      });
    }
    
    // Meta Pixel
    if (typeof fbq !== 'undefined') {
      fbq('track', 'ViewContent', {
        content_ids: [productData.product_id],
        content_name: productData.product_name,
        content_type: 'product',
        value: productData.value,
        currency: productData.currency,
      });
    }
    
    // TikTok Pixel
    if (typeof ttq !== 'undefined') {
      ttq.track('ViewContent', {
        contents: [{
          content_type: 'product',
          content_id: productData.product_id,
          content_name: productData.product_name,
        }],
        value: productData.value,
        currency: productData.currency,
      });
    }
  }
  
  // Track add to cart
  trackAddToCart(productData: ProductTrackingData): void {
    if (!this.trackingEnabled || !this.isInitialized) return;
    
    // Google Analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'add_to_cart', {
        items: [{
          item_id: productData.product_id,
          item_name: productData.product_name,
          item_category: productData.product_category,
          price: productData.price,
          quantity: productData.quantity,
        }],
        value: productData.value,
        currency: productData.currency,
      });
    }
    
    // Meta Pixel
    if (typeof fbq !== 'undefined') {
      fbq('track', 'AddToCart', {
        content_ids: [productData.product_id],
        content_name: productData.product_name,
        content_type: 'product',
        value: productData.value,
        currency: productData.currency,
      });
    }
    
    // TikTok Pixel
    if (typeof ttq !== 'undefined') {
      ttq.track('AddToCart', {
        contents: [{
          content_type: 'product',
          content_id: productData.product_id,
          content_name: productData.product_name,
        }],
        value: productData.value,
        currency: productData.currency,
      });
    }
  }
  
  // Track checkout start (for abandonment tracking)
  trackCheckoutStart(checkoutData: CheckoutTrackingData): void {
    if (!this.trackingEnabled || !this.isInitialized) return;
    
    // Google Analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'begin_checkout', {
        value: checkoutData.value,
        currency: checkoutData.currency,
        items: checkoutData.contents.map(content => ({
          item_id: content.id,
          quantity: content.quantity,
          item_price: content.item_price,
        })),
      });
    }
    
    // Meta Pixel
    if (typeof fbq !== 'undefined') {
      fbq('track', 'InitiateCheckout', {
        contents: checkoutData.contents,
        value: checkoutData.value,
        currency: checkoutData.currency,
        content_type: checkoutData.content_type || 'product',
      });
    }
    
    // TikTok Pixel
    if (typeof ttq !== 'undefined') {
      ttq.track('InitiateCheckout', {
        contents: checkoutData.contents,
        value: checkoutData.value,
        currency: checkoutData.currency,
      });
    }
  }
  
  // Track successful purchase
  trackPurchase(checkoutData: CheckoutTrackingData, orderId?: string): void {
    if (!this.trackingEnabled || !this.isInitialized) return;
    
    // Google Analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'purchase', {
        transaction_id: orderId,
        value: checkoutData.value,
        currency: checkoutData.currency,
        items: checkoutData.contents.map(content => ({
          item_id: content.id,
          quantity: content.quantity,
          item_price: content.item_price,
        })),
      });
    }
    
    // Meta Pixel
    if (typeof fbq !== 'undefined') {
      fbq('track', 'Purchase', {
        content_ids: checkoutData.contents.map(c => c.id),
        contents: checkoutData.contents,
        value: checkoutData.value,
        currency: checkoutData.currency,
      });
    }
    
    // TikTok Pixel
    if (typeof ttq !== 'undefined') {
      ttq.track('Purchase', {
        contents: checkoutData.contents,
        value: checkoutData.value,
        currency: checkoutData.currency,
      });
    }
  }
  
  // Track checkout abandonment
  trackCheckoutAbandonment(checkoutData: CheckoutTrackingData): void {
    if (!this.trackingEnabled || !this.isInitialized) return;
    
    // Custom event for abandonment
    this.trackEvent({
      eventName: 'checkout_abandoned',
      parameters: {
        ...checkoutData,
        timestamp: new Date().toISOString(),
      },
    });
  }
  
  // Load Google Analytics
  private loadGoogleAnalytics(): void {
    // Load GA4 script if not already loaded
    const gaMeasurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    if (!window.gtag && gaMeasurementId) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`;
      document.head.appendChild(script);
      
      // Initialize gtag
      window.dataLayer = window.dataLayer || [];
      function gtag(...args: any[]) {
        window.dataLayer.push(args);
      }
      gtag('js', new Date());
      gtag('config', gaMeasurementId);
    }
  }
  
  // Load Meta Pixel
  private loadMetaPixel(): void {
    // Load Meta Pixel script if not already loaded
    const fbPixelId = import.meta.env.VITE_FACEBOOK_PIXEL_ID;
    if (!window.fbq && fbPixelId) {
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
        }
      })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
      
      fbq('init', fbPixelId);
      fbq('track', 'PageView');
    }
  }
  
  // Load TikTok Pixel
  private loadTikTokPixel(): void {
    // Load TikTok Pixel script if not already loaded
    const tiktokPixelId = import.meta.env.VITE_TIKTOK_PIXEL_ID;
    if (!window.ttq && tiktokPixelId) {
      (function (w: any, d: any, t: any) {
        w.TiktokAnalyticsObject = t;
        var ttq = (w[t] = w[t] || []);
        ttq.methods = [
          'page',
          'track',
          'identify',
          'instances',
          'debug',
          'on',
          'off',
          'once',
          'ready',
          'alias',
          'group',
          'enableCookie',
          'disableCookie',
        ];
        ttq.setAndDefer = function (t: any, e: any) {
          t[e] = function () {
            t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
          };
        };
        for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
        ttq.instance = function (t: any) {
          for (var e = ttq._i[t] || [], n = 0; n < ttq.methods.length; n++)
            ttq.setAndDefer(e, ttq.methods[n]);
          return e;
        };
        ttq.load = function (e: any, n: any) {
          var i = 'https://analytics.tiktok.com/i18n/pixel/events.js';
          var o = d.createElement(t);
          o.src = i;
          o.async = !0;
          o.onload = function () {
            w[t].init(e, n);
            w[t].ready(function () {
              // Pixel is ready
            });
          };
          var a = d.getElementsByTagName(t)[0];
          if (a.parentNode) {
            a.parentNode.insertBefore(o, a);
          }
        };
      })(window, document, 'ttq');
      
      ttq.load(tiktokPixelId);
    }
  }
  
  // Send event to Google Analytics
  private trackOnGoogle(event: AnalyticsEvent): void {
    if (typeof gtag !== 'undefined') {
      gtag('event', event.eventName, {
        ...event.parameters,
        event_callback: () => {
          // Optional: Handle callback
        }
      });
    }
  }
  
  // Send event to Meta Pixel
  private trackOnMeta(event: AnalyticsEvent): void {
    if (typeof fbq !== 'undefined') {
      fbq('trackCustom', event.eventName, event.parameters);
    }
  }
  
  // Send event to TikTok Pixel
  private trackOnTikTok(event: AnalyticsEvent): void {
    if (typeof ttq !== 'undefined') {
      ttq.track(event.eventName, event.parameters);
    }
  }
}

// Create singleton instance
export const analyticsService = new AnalyticsService();

// Global types for tracking pixels
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
    fbq: any;
    ttq: any;
    _fbq: any;
  }

  var gtag: any;
  var fbq: any;
  var ttq: any;
}

// Initialize analytics service when app loads
analyticsService.initialize();
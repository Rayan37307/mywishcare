// services/pixelConfirmationService.ts
// Service for sharing pixel confirmation data for order verification

import { analyticsService, type CheckoutTrackingData } from './analyticsService';

export interface OrderConfirmationData {
  orderId: string;
  value: number;
  currency: string;
  contents: Array<{
    id: string | number;
    quantity: number;
    item_price?: number;
  }>;
  email?: string;
  phone?: string;
  customerName?: string;
  timestamp: number;
}

export interface PixelVerificationResult {
  orderId: string;
  confirmedByPixel: boolean;
  pixelProviders: string[]; // Which pixels confirmed
  timestamp: number;
  status: 'verified' | 'pending' | 'failed';
}

class PixelConfirmationService {
  private orderConfirmations: Map<string, PixelVerificationResult> = new Map();
  private pendingConfirmations: Set<string> = new Set();
  
  constructor() {
    // Set up regular verification checks
    this.startVerificationScheduler();
  }
  
  // Track an order with pixel confirmation
  trackOrder(orderData: OrderConfirmationData, pixelProviders: string[] = ['Meta', 'Google', 'TikTok']): void {
    // Mark this order as pending confirmation
    this.pendingConfirmations.add(orderData.orderId);
    
    // Initialize verification result
    const result: PixelVerificationResult = {
      orderId: orderData.orderId,
      confirmedByPixel: false,
      pixelProviders: [],
      timestamp: Date.now(),
      status: 'pending',
    };
    
    this.orderConfirmations.set(orderData.orderId, result);
    
    // Send purchase event to all specified pixel providers
    this.sendPurchaseEvent(orderData, pixelProviders);
    
    // Store in localStorage
    this.saveConfirmations();
  }
  
  // Send purchase event to specified pixel providers
  private sendPurchaseEvent(data: OrderConfirmationData, providers: string[]): void {
    // Prepare checkout data for pixel tracking
    const checkoutData: CheckoutTrackingData = {
      value: data.value,
      currency: data.currency,
      contents: data.contents,
      content_type: 'product',
    };
    
    // Send to each specified provider
    providers.forEach(provider => {
      switch(provider.toLowerCase()) {
        case 'meta':
        case 'facebook':
          this.sendToMetaPixel(checkoutData, data.orderId);
          break;
        case 'google':
          this.sendToGoogleAnalytics(checkoutData, data.orderId);
          break;
        case 'tiktok':
          this.sendToTikTokPixel(checkoutData, data.orderId);
          break;
        default:
          console.warn(`Unknown pixel provider: ${provider}`);
      }
    });
  }
  
  // Send purchase event to Meta Pixel
  private sendToMetaPixel(checkoutData: CheckoutTrackingData, orderId: string): void {
    // Track purchase via analytics service
    analyticsService.trackPurchase(checkoutData, orderId);
    
    // Additional Meta Pixel specific tracking
    if (typeof (window as any).fbq !== 'undefined') {
      (window as any).fbq('track', 'Purchase', {
        value: checkoutData.value,
        currency: checkoutData.currency,
        content_ids: checkoutData.contents.map(c => c.id),
        contents: checkoutData.contents,
        transaction_id: orderId,
      });
    }
  }
  
  // Send purchase event to Google Analytics
  private sendToGoogleAnalytics(checkoutData: CheckoutTrackingData, orderId: string): void {
    // Track purchase via analytics service
    analyticsService.trackPurchase(checkoutData, orderId);
    
    // Additional Google Analytics specific tracking
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('event', 'purchase', {
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
  }
  
  // Send purchase event to TikTok Pixel
  private sendToTikTokPixel(checkoutData: CheckoutTrackingData, orderId: string): void {
    // Track purchase via analytics service
    analyticsService.trackPurchase(checkoutData, orderId);
    
    // Additional TikTok Pixel specific tracking
    if (typeof (window as any).ttq !== 'undefined') {
      (window as any).ttq.track('Purchase', {
        contents: checkoutData.contents,
        value: checkoutData.value,
        currency: checkoutData.currency,
        event_id: orderId,
      });
    }
  }
  
  // Verify if an order has been confirmed by pixels
  verifyOrderConfirmation(orderId: string): PixelVerificationResult {
    const result = this.orderConfirmations.get(orderId);
    
    if (!result) {
      // If no record exists, create a default one
      const newResult: PixelVerificationResult = {
        orderId,
        confirmedByPixel: false,
        pixelProviders: [],
        timestamp: Date.now(),
        status: 'pending',
      };
      this.orderConfirmations.set(orderId, newResult);
      this.saveConfirmations();
      return newResult;
    }
    
    return result;
  }
  
  // Manual confirmation - for cases where we receive direct confirmation
  confirmOrder(orderId: string, provider: string): void {
    let result = this.orderConfirmations.get(orderId);
    
    if (!result) {
      result = {
        orderId,
        confirmedByPixel: false,
        pixelProviders: [],
        timestamp: Date.now(),
        status: 'pending',
      };
    }
    
    // Add provider to confirmed list if not already there
    if (!result.pixelProviders.includes(provider)) {
      result.pixelProviders.push(provider);
      
      // If we have at least one confirmation, mark as verified
      if (result.pixelProviders.length > 0) {
        result.confirmedByPixel = true;
        result.status = 'verified';
      }
    }
    
    this.orderConfirmations.set(orderId, result);
    this.pendingConfirmations.delete(orderId); // Remove from pending
    this.saveConfirmations();
  }
  
  // Get all confirmed orders
  getConfirmedOrders(): PixelVerificationResult[] {
    return Array.from(this.orderConfirmations.values())
      .filter(result => result.confirmedByPixel);
  }
  
  // Get pending confirmations
  getPendingConfirmations(): PixelVerificationResult[] {
    return Array.from(this.orderConfirmations.values())
      .filter(result => result.status === 'pending');
  }
  
  // Get order verification statistics
  getVerificationStats(): {
    totalOrders: number;
    confirmedOrders: number;
    pendingOrders: number;
    confirmationRate: number;
  } {
    const allOrders = Array.from(this.orderConfirmations.values());
    const confirmed = allOrders.filter(o => o.confirmedByPixel).length;
    
    return {
      totalOrders: allOrders.length,
      confirmedOrders: confirmed,
      pendingOrders: allOrders.length - confirmed,
      confirmationRate: allOrders.length > 0 ? confirmed / allOrders.length : 0,
    };
  }
  
  // Start scheduler to regularly check for confirmations
  private startVerificationScheduler(): void {
    // Check for confirmations every 5 minutes
    setInterval(() => {
      this.checkForNewConfirmations();
    }, 5 * 60 * 1000);
  }
  
  // Check for new confirmations
  private checkForNewConfirmations(): void {
    // This would normally involve checking server-side or 
    // other confirmation mechanisms
    // For this implementation, we'll just log it
    console.log('Checking for new pixel confirmations...');
    
    // In a real implementation, you might:
    // 1. Poll a server endpoint
    // 2. Check for webhooks
    // 3. Listen for events from pixel providers
  }
  
  // Save confirmations to localStorage
  private saveConfirmations(): void {
    try {
      const confirmationsArray = Array.from(this.orderConfirmations.entries());
      localStorage.setItem('pixelConfirmations', JSON.stringify(confirmationsArray));
    } catch (e) {
      console.error('Failed to save pixel confirmations', e);
    }
  }
  
  // Load confirmations from localStorage
  private loadConfirmations(): void {
    try {
      const stored = localStorage.getItem('pixelConfirmations');
      if (stored) {
        const confirmationsArray: [string, PixelVerificationResult][] = JSON.parse(stored);
        confirmationsArray.forEach(([orderId, result]) => {
          this.orderConfirmations.set(orderId, result);
          if (result.status === 'pending') {
            this.pendingConfirmations.add(orderId);
          }
        });
      }
    } catch (e) {
      console.error('Failed to load pixel confirmations', e);
    }
  }
  
  // Clear old confirmations data
  clearOldData(olderThan: number = 30 * 24 * 60 * 60 * 1000): void { // 30 days
    const cutoffTime = Date.now() - olderThan;
    
    for (const [orderId, result] of this.orderConfirmations.entries()) {
      if (result.timestamp < cutoffTime) {
        this.orderConfirmations.delete(orderId);
        this.pendingConfirmations.delete(orderId);
      }
    }
    
    this.saveConfirmations();
  }
}

// Singleton instance
export const pixelConfirmationService = new PixelConfirmationService();

// Initialize by loading stored data
pixelConfirmationService.loadConfirmations();
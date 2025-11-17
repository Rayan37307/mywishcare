// services/productTrackingService.ts
// Service for tracking products in real-time

import { pixelYourSiteService } from './pixelYourSiteService';

export interface ProductTrackingOptions {
  trackViews: boolean;
  trackClicks: boolean;
  trackAddsToCart: boolean;
  trackPurchases: boolean;
}

export interface TrackedProduct {
  id: string | number;
  name: string;
  category?: string;
  price: number;
  currency?: string;
  quantity?: number;
  timestamp: number;
}

class ProductTrackingService {
  private trackedProducts: Map<string | number, TrackedProduct> = new Map();
  private options: ProductTrackingOptions;
  
  constructor(options?: Partial<ProductTrackingOptions>) {
    this.options = {
      trackViews: true,
      trackClicks: true,
      trackAddsToCart: true,
      trackPurchases: true,
      ...options,
    };
  }
  
  // Track that a product was viewed
  trackProductView(productId: string | number, productName: string, price: number, category?: string): void {
    if (!this.options.trackViews) return;
    
    const productData = {
      product_id: productId,
      product_name: productName,
      product_category: category,
      product_price: price,
      currency: 'INR', // Default to Indian currency
      value: price,
    };
    
    pixelYourSiteService.trackProductView(productData);
    
    // Store in our local tracking
    this.trackedProducts.set(productId, {
      id: productId,
      name: productName,
      category,
      price,
      currency: 'INR',
      quantity: 1,
      timestamp: Date.now(),
    });
  }
  

  
  // Track that a product was clicked
  trackProductClick(productId: string | number, productName: string, price: number, category?: string): void {
    if (!this.options.trackClicks) return;
    
    // Track as a custom event through PixelYourSite
    pixelYourSiteService.trackCustomEvent('product_click', {
      product_id: productId,
      product_name: productName,
      product_category: category,
      price,
      currency: 'INR',
      timestamp: new Date().toISOString(),
    });
  }
  
  // Track that a product was added to cart
  trackAddToCart(productId: string | number, productName: string, price: number, quantity: number = 1, category?: string): void {
    if (!this.options.trackAddsToCart) return;
    
    const productData = {
      product_id: productId,
      product_name: productName,
      product_category: category,
      product_price: price,
      currency: 'INR',
      quantity,
      value: price * quantity,
    };
    
    pixelYourSiteService.trackAddToCart(productData);
  }
  
  // Track that a product was purchased
  trackPurchase(productId: string | number, productName: string, price: number, quantity: number = 1, orderId?: string, category?: string): void {
    if (!this.options.trackPurchases) return;
    
    const checkoutData = {
      value: price * quantity,
      currency: 'INR',
      contents: [{
        id: productId,
        quantity,
        item_price: price,
      }],
      order_id: orderId,
    };
    
    pixelYourSiteService.trackPurchase(checkoutData);
    
    // Optionally store in local tracking
    this.trackedProducts.set(productId, {
      id: productId,
      name: productName,
      category,
      price,
      currency: 'INR',
      quantity,
      timestamp: Date.now(),
    });
  }
  
  // Get real-time product performance data
  getTrackedProducts(): TrackedProduct[] {
    return Array.from(this.trackedProducts.values());
  }
  
  // Get most viewed products
  getMostViewedProducts(limit: number = 10): TrackedProduct[] {
    // In a real implementation, this would aggregate view counts from analytics
    return this.getTrackedProducts()
      .sort((a, b) => b.timestamp - a.timestamp) // Sort by recency
      .slice(0, limit);
  }
  
  // Get top performing products
  getTopPerformingProducts(): number[] {
    // In a real implementation, this would come from analytics data
    // For now, return a mock implementation
    return Array.from(this.trackedProducts.keys()).slice(0, 5).map(Number);
  }
  
  // Clear tracking data older than specified time (in milliseconds)
  clearOldData(olderThan: number = 24 * 60 * 60 * 1000): void { // Default to 24 hours
    const cutoffTime = Date.now() - olderThan;
    this.trackedProducts.forEach((product, id) => {
      if (product.timestamp < cutoffTime) {
        this.trackedProducts.delete(id);
      }
    });
  }
  
  // Update tracking options
  updateOptions(newOptions: Partial<ProductTrackingOptions>): void {
    this.options = { ...this.options, ...newOptions };
  }
  
  // Reset tracking data
  reset(): void {
    this.trackedProducts.clear();
  }
}

// Singleton instance
export const productTrackingService = new ProductTrackingService();

// Function to initialize product tracking when the app starts
export const initializeProductTracking = (): void => {
  // Add tracking to product views
  // This would typically be called from components that display products
};
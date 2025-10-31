// services/checkoutTrackingService.ts
// Service for tracking checkout abandonment (users who fill form but don't submit)

import { analyticsService, type CheckoutTrackingData } from './analyticsService';

export interface CheckoutFormState {
  email: string;
  name: string;
  address1: string;
  district: string;
  phone: string;
  countryCode: string;
  marketingOptIn: boolean;
  saveShippingInfo: boolean;
  billingAddressSame: boolean;
  billingName?: string;
  billingAddress1?: string;
  billingDistrict?: string;
  paymentMethod: string;
  notes: string;
}

export interface AbandonedCheckoutData {
  formData: CheckoutFormState;
  cartItems: Array<{
    product_id: string | number;
    quantity: number;
    price: number;
    name: string;
  }>;
  value: number;
  currency: string;
  timestamp: number;
  sessionId: string;
  ip?: string;
  userAgent?: string;
}

class CheckoutTrackingService {
  private activeCheckouts: Map<string, CheckoutFormState> = new Map();
  private abandonedCheckouts: AbandonedCheckoutData[] = [];
  private formChangedTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly abandonmentThresholdMs: number = 5 * 60 * 1000; // 5 minutes
  
  // Track when user starts checkout
  trackCheckoutStart(
    formData: CheckoutFormState, 
    cartItems: any[],
    value: number
  ): string {
    const sessionId = this.generateSessionId();
    
    // Store the active checkout session
    this.activeCheckouts.set(sessionId, formData);
    
    // Prepare checkout tracking data
    const checkoutData: CheckoutTrackingData = {
      value,
      currency: 'INR',
      contents: cartItems.map(item => ({
        id: item.product.id,
        quantity: item.quantity,
        item_price: parseFloat(item.product.price.replace(/[^\\d.-]/g, '')),
      })),
      content_type: 'product',
    };
    
    // Track the checkout start event
    analyticsService.trackCheckoutStart(checkoutData);
    
    // Set a timer to track potential abandonment
    setTimeout(() => {
      if (this.activeCheckouts.has(sessionId)) {
        // User didn't complete checkout within the time threshold
        this.handleAbandonedCheckout(sessionId, formData, cartItems, value);
      }
    }, this.abandonmentThresholdMs);
    
    return sessionId;
  }
  
  // Track form changes to detect user engagement
  trackFormChange(sessionId: string, formData: CheckoutFormState): void {
    this.activeCheckouts.set(sessionId, formData);
    
    // Clear any previous timer since user is still engaged
    if (this.formChangedTimer) {
      clearTimeout(this.formChangedTimer);
    }
    
    // Set a new timer to track abandonment after inactivity
    this.formChangedTimer = setTimeout(() => {
      if (this.activeCheckouts.has(sessionId)) {
        // User has been inactive for a while
        this.handleAbandonedCheckout(
          sessionId, 
          formData, 
          [], // For this implementation, we won't have cart items here
          0   // Placeholder value
        );
      }
    }, 3 * 60 * 1000); // 3 minutes of inactivity
  }
  
  // Track successful checkout completion
  trackCheckoutComplete(sessionId: string): void {
    // Remove the active checkout session
    this.activeCheckouts.delete(sessionId);
    
    // Clear the timer if it exists
    if (this.formChangedTimer) {
      clearTimeout(this.formChangedTimer);
      this.formChangedTimer = null;
    }
  }
  
  // Handle abandoned checkout scenario
  private handleAbandonedCheckout(
    sessionId: string, 
    formData: CheckoutFormState, 
    cartItems: any[], 
    value: number
  ): void {
    // Remove from active checkouts
    this.activeCheckouts.delete(sessionId);
    
    // Track as abandoned checkout
    const abandonedCheckout: AbandonedCheckoutData = {
      formData,
      cartItems: cartItems.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        price: parseFloat(item.product.price.replace(/[^\\d.-]/g, '')),
        name: item.product.name,
      })),
      value,
      currency: 'INR',
      timestamp: Date.now(),
      sessionId,
      userAgent: navigator.userAgent,
      ip: undefined, // In a real implementation, this would come from backend
    };
    
    // Add to abandoned checkouts list
    this.abandonedCheckouts.push(abandonedCheckout);
    
    // Track abandonment event
    const checkoutData: CheckoutTrackingData = {
      value,
      currency: 'INR',
      contents: cartItems.map(item => ({
        id: item.product.id,
        quantity: item.quantity,
        item_price: parseFloat(item.product.price.replace(/[^\\d.-]/g, '')),
      })),
    };
    
    analyticsService.trackCheckoutAbandonment(checkoutData);
    
    // Store in localStorage temporarily for retrieval later
    this.saveAbandonedCheckouts();
    
    // Optionally, try to recover the checkout with an incentive
    this.attemptCheckoutRecovery(abandonedCheckout);
  }
  
  // Attempt to recover abandoned checkout
  private attemptCheckoutRecovery(abandonedCheckout: AbandonedCheckoutData): void {
    // This could trigger a modal offering discount, etc.
    console.log('Checkout abandoned, considering recovery options', { orderId: abandonedCheckout.sessionId });
    
    // In a real implementation, you might show a discount offer
    // to encourage the user to return and complete their purchase
  }
  
  // Get abandoned checkout data
  getAbandonedCheckouts(): AbandonedCheckoutData[] {
    return this.abandonedCheckouts;
  }
  
  // Save abandoned checkouts to localStorage
  private saveAbandonedCheckouts(): void {
    try {
      localStorage.setItem('abandonedCheckouts', JSON.stringify(this.abandonedCheckouts));
    } catch (e) {
      console.error('Failed to save abandoned checkouts to localStorage', e);
    }
  }
  
  // Load abandoned checkouts from localStorage
  private loadAbandonedCheckouts(): void {
    try {
      const stored = localStorage.getItem('abandonedCheckouts');
      if (stored) {
        this.abandonedCheckouts = JSON.parse(stored);
        // Remove checkouts older than 7 days
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        this.abandonedCheckouts = this.abandonedCheckouts.filter(
          checkout => checkout.timestamp > sevenDaysAgo
        );
      }
    } catch (e) {
      console.error('Failed to load abandoned checkouts from localStorage', e);
      this.abandonedCheckouts = [];
    }
  }
  
  // Generate a unique session ID
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  // Clear old abandoned checkouts
  clearOldData(olderThan: number = 7 * 24 * 60 * 60 * 1000): void { // 7 days default
    const cutoffTime = Date.now() - olderThan;
    this.abandonedCheckouts = this.abandonedCheckouts.filter(
      checkout => checkout.timestamp > cutoffTime
    );
    this.saveAbandonedCheckouts();
  }
  
  // Initialize the service
  initialize(): void {
    this.loadAbandonedCheckouts();
  }
  
  // Get summary statistics
  getAbandonmentStats(): {
    totalAbandoned: number;
    recoveryRate: number;
    topAbandonmentPoints: string[];
  } {
    return {
      totalAbandoned: this.abandonedCheckouts.length,
      recoveryRate: 0, // Would be calculated based on recovery attempts
      topAbandonmentPoints: ['delivery_info', 'payment_info'], // Common points
    };
  }
}

// Singleton instance
export const checkoutTrackingService = new CheckoutTrackingService();

// Initialize on service creation
checkoutTrackingService.initialize();
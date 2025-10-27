// services/fakeOrderBlockingService.ts
// Service for blocking fake orders using IP tracking and pattern recognition

export interface OrderData {
  email: string;
  firstName: string;
  lastName: string;
  address1: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  items: Array<{
    product_id: string | number;
    quantity: number;
  }>;
  total: number;
  ip: string;
  userAgent?: string;
  timestamp: number;
}

export interface IPBlockRule {
  ip: string;
  reason: string;
  timestamp: number;
  expiresAt?: number; // Optional expiration time
}

export interface FakeOrderDetectionResult {
  isSuspicious: boolean;
  confidence: number; // 0-1
  reasons: string[];
  shouldBlock: boolean;
}

class FakeOrderBlockingService {
  private ipBlockList: Map<string, IPBlockRule> = new Map();
  private orderHistory: OrderData[] = [];
  private suspiciousOrders: OrderData[] = [];
  
  // Thresholds for detection
  private readonly ORDER_RATE_THRESHOLD = 5; // Max orders per hour from same IP
  private readonly SAME_INFO_THRESHOLD = 10; // Same address/name used multiple times
  
  constructor() {
    this.loadBlockedIPs();
    this.loadOrderHistory();
  }
  
  // Check if an order should be blocked
  checkOrderForFraud(orderData: OrderData): FakeOrderDetectionResult {
    const results: FakeOrderDetectionResult = {
      isSuspicious: false,
      confidence: 0,
      reasons: [],
      shouldBlock: false,
    };
    
    // Check if IP is already blocked
    if (this.isIPBlocked(orderData.ip)) {
      results.isSuspicious = true;
      results.confidence = 1;
      results.reasons.push(`IP ${orderData.ip} is on block list`);
      results.shouldBlock = true;
      return results;
    }
    
    // Check order rate from same IP
    const ordersFromIP = this.getOrdersFromIP(orderData.ip);
    if (ordersFromIP.length >= this.ORDER_RATE_THRESHOLD) {
      const recentOrders = ordersFromIP.filter(order => 
        order.timestamp > Date.now() - (60 * 60 * 1000) // Last hour
      );
      
      if (recentOrders.length >= this.ORDER_RATE_THRESHOLD) {
        results.isSuspicious = true;
        results.confidence = Math.min(results.confidence + 0.8, 1);
        results.reasons.push(`High order rate from IP: ${recentOrders.length} orders in last hour`);
        results.shouldBlock = true;
      }
    }
    
    // Check for suspicious patterns in the order
    if (this.hasSuspiciousPatterns(orderData)) {
      results.isSuspicious = true;
      results.confidence = Math.min(results.confidence + 0.3, 1);
      results.reasons.push('Order contains suspicious patterns');
    }
    
    // Check for duplicate information
    if (this.hasDuplicateInfo(orderData)) {
      results.isSuspicious = true;
      results.confidence = Math.min(results.confidence + 0.4, 1);
      results.reasons.push('Order information matches previous suspicious orders');
    }
    
    // Increase confidence if multiple flags
    if (results.reasons.length > 1) {
      results.confidence = Math.min(results.confidence + 0.2, 1);
    }
    
    // Block if confidence is high enough
    if (results.confidence > 0.6) {
      results.shouldBlock = true;
    }
    
    // If suspicious, add to suspicious list
    if (results.isSuspicious) {
      this.suspiciousOrders.push(orderData);
    }
    
    return results;
  }
  
  // Add an IP to the block list
  blockIP(ip: string, reason: string, expiresAt?: number): void {
    const rule: IPBlockRule = {
      ip,
      reason,
      timestamp: Date.now(),
      expiresAt,
    };
    
    this.ipBlockList.set(ip, rule);
    this.saveBlockedIPs();
  }
  
  // Remove an IP from the block list
  unblockIP(ip: string): void {
    this.ipBlockList.delete(ip);
    this.saveBlockedIPs();
  }
  
  // Check if an IP is blocked
  isIPBlocked(ip: string): boolean {
    const rule = this.ipBlockList.get(ip);
    if (!rule) return false;
    
    // Check if block has expired
    if (rule.expiresAt && Date.now() > rule.expiresAt) {
      this.unblockIP(ip);
      return false;
    }
    
    return true;
  }
  
  // Process an order (check and potentially store)
  processOrder(orderData: OrderData): FakeOrderDetectionResult {
    const result = this.checkOrderForFraud(orderData);
    
    // Store the order for future reference
    this.orderHistory.push(orderData);
    
    // If the order is flagged as suspicious, potentially block the IP
    if (result.isSuspicious && result.confidence > 0.8) {
      this.blockIP(orderData.ip, `Suspicious order detected: ${result.reasons.join(', ')}`, 
                   Date.now() + (24 * 60 * 60 * 1000)); // Block for 24 hours
    }
    
    return result;
  }
  
  // Get all blocked IPs
  getBlockedIPs(): IPBlockRule[] {
    return Array.from(this.ipBlockList.values());
  }
  
  // Get suspicious orders
  getSuspiciousOrders(): OrderData[] {
    return this.suspiciousOrders;
  }
  
  // Reset order history (for testing or cleanup)
  resetOrderHistory(): void {
    this.orderHistory = [];
    this.suspiciousOrders = [];
  }
  
  // Clean up expired IP blocks
  cleanupExpiredBlocks(): void {
    const now = Date.now();
    for (const [ip, rule] of this.ipBlockList.entries()) {
      if (rule.expiresAt && now > rule.expiresAt) {
        this.ipBlockList.delete(ip);
      }
    }
    this.saveBlockedIPs();
  }
  
  // Get statistics
  getStatistics(): {
    totalOrdersProcessed: number;
    suspiciousOrders: number;
    blockedIPs: number;
    fakeOrderRate: number;
  } {
    return {
      totalOrdersProcessed: this.orderHistory.length,
      suspiciousOrders: this.suspiciousOrders.length,
      blockedIPs: this.ipBlockList.size,
      fakeOrderRate: this.orderHistory.length > 0 
        ? this.suspiciousOrders.length / this.orderHistory.length 
        : 0,
    };
  }
  
  // Private helper methods
  
  private getOrdersFromIP(ip: string): OrderData[] {
    return this.orderHistory.filter(order => order.ip === ip);
  }
  
  private hasSuspiciousPatterns(orderData: OrderData): boolean {
    // Check for common fake order patterns
    const patterns = [
      // Suspicious email patterns
      orderData.email.includes('temp'),
      orderData.email.includes('disposable'),
      orderData.email.includes('10minutemail'),
      // Suspicious address patterns
      orderData.address1.toLowerCase().includes('fake'),
      orderData.firstName.toLowerCase().includes('test'),
      orderData.lastName.toLowerCase().includes('test'),
      // Suspicious phone patterns
      orderData.phone.match(/^(\d)\1{9,}$/), // All same digit
    ];
    
    return patterns.some(pattern => pattern);
  }
  
  private hasDuplicateInfo(orderData: OrderData): boolean {
    // Check if the same address/contact info has been used many times
    const similarOrders = this.orderHistory.filter(order => {
      return (
        order.address1 === orderData.address1 &&
        order.city === orderData.city &&
        order.state === orderData.state
      );
    });
    
    return similarOrders.length >= this.SAME_INFO_THRESHOLD;
  }
  
  private loadBlockedIPs(): void {
    try {
      const stored = localStorage.getItem('blockedIPs');
      if (stored) {
        const rules: IPBlockRule[] = JSON.parse(stored);
        rules.forEach(rule => {
          this.ipBlockList.set(rule.ip, rule);
        });
      }
    } catch (e) {
      console.error('Failed to load blocked IPs', e);
    }
  }
  
  private saveBlockedIPs(): void {
    try {
      localStorage.setItem('blockedIPs', JSON.stringify(Array.from(this.ipBlockList.values())));
    } catch (e) {
      console.error('Failed to save blocked IPs', e);
    }
  }
  
  private loadOrderHistory(): void {
    try {
      const stored = localStorage.getItem('orderHistory');
      if (stored) {
        this.orderHistory = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load order history', e);
    }
  }
  
  private saveOrderHistory(): void {
    try {
      localStorage.setItem('orderHistory', JSON.stringify(this.orderHistory));
    } catch (e) {
      console.error('Failed to save order history', e);
    }
  }
}

// Singleton instance
export const fakeOrderBlockingService = new FakeOrderBlockingService();
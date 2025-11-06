// src/services/woocommerce.service.ts
import type { Product } from '../types/product';

// WooCommerce API Configuration
const WOOCOMMERCE_API_URL = import.meta.env.VITE_WC_API_URL || 'https://wishcarebd.com/wp-json/wc/v3';
const CONSUMER_KEY = import.meta.env.VITE_WC_CONSUMER_KEY || 'ck_23112f91dee60de7b243c658e5f4ddbb5250b745';
const CONSUMER_SECRET = import.meta.env.VITE_WC_CONSUMER_SECRET || 'cs_bb75d74565ffe29d3f47ea79948397214d7fb18a';

class WooCommerceService {
  private apiURL: string;
  private consumerKey: string;
  private consumerSecret: string;

  constructor() {
    this.apiURL = WOOCOMMERCE_API_URL;
    this.consumerKey = CONSUMER_KEY;
    this.consumerSecret = CONSUMER_SECRET;
  }

  // Build authenticated URL with consumer key and secret
  private buildAuthURL(endpoint: string): string {
    const separator = endpoint.includes('?') ? '&' : '?';
    return `${this.apiURL}${endpoint}${separator}consumer_key=${this.consumerKey}&consumer_secret=${this.consumerSecret}`;
  }

  // Fetch all products
  async fetchProducts(): Promise<Product[]> {
    try {
      const response = await fetch(this.buildAuthURL('/products'));
      
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
      }
      
      const products = await response.json();
      return products.map((product: any) => this.transformProduct(product));
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  // Fetch product by ID
  async fetchProductById(id: number): Promise<Product | null> {
    try {
      const response = await fetch(this.buildAuthURL(`/products/${id}`));
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to fetch product: ${response.status} ${response.statusText}`);
      }
      
      const product = await response.json();
      return this.transformProduct(product);
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  // Search products
  async searchProducts(searchTerm: string): Promise<Product[]> {
    try {
      const response = await fetch(this.buildAuthURL(`/products?search=${encodeURIComponent(searchTerm)}`));
      
      if (!response.ok) {
        throw new Error(`Failed to search products: ${response.status} ${response.statusText}`);
      }
      
      const products = await response.json();
      return products.map((product: any) => this.transformProduct(product));
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }

  // Fetch products by category
  async fetchProductsByCategory(categoryId: number): Promise<Product[]> {
    try {
      const response = await fetch(this.buildAuthURL(`/products?category=${categoryId}`));
      
      if (!response.ok) {
        throw new Error(`Failed to fetch products by category: ${response.status} ${response.statusText}`);
      }
      
      const products = await response.json();
      return products.map((product: any) => this.transformProduct(product));
    } catch (error) {
      console.error('Error fetching products by category:', error);
      throw error;
    }
  }

  // Transform WooCommerce product to our Product type
  private transformProduct(wooProduct: any): Product {
    return {
      id: wooProduct.id,
      name: wooProduct.name,
      slug: wooProduct.slug || '',
      price: wooProduct.price || '0.00',
      regular_price: wooProduct.regular_price,
      sale_price: wooProduct.sale_price,
      images: wooProduct.images && wooProduct.images.length > 0 
        ? wooProduct.images.map((img: any) => ({
            src: img.src,
            alt: img.alt || wooProduct.name
          }))
        : [{ 
            src: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPgogIDxwYXRoIGQ9Ik0yMiAydi0yYTIgMiAwIDAgMC0yLTJIMTRhMiAyIDAgMCAwLTIgMnYySDRhMiAyIDAgMCAwLTIgMnYxNGEyIDIgMCAwIDAgMiAyaDE2YTIgMiAwIDAgMCAyLTJWMnptLTQgMTZINnYtMmgxMnYyem0wLTRINnYtMmgxMnYyem0wLTRINnYtMmgxMnYyem0wLTRINnYtMmgxMnYyem0wLTRINnYtMmgxMnYyeiIgLz4KPC9zdmc+', // Placeholder image
            alt: 'Placeholder'
          }],
      description: wooProduct.description || 'No description available',
      short_description: wooProduct.short_description || wooProduct.description || 'No description available',
      stock_quantity: wooProduct.stock_quantity,
      manage_stock: Boolean(wooProduct.manage_stock), // Include manage_stock property
      stock_status: wooProduct.stock_status as 'instock' | 'outofstock' | 'onbackorder',
      categories: (wooProduct.categories || []).map((cat: any) => ({
        id: cat.id,
        name: cat.name
      }))
    };
  }

  // Create order
  async createOrder(orderData: any): Promise<any> {
    try {
      const response = await fetch(this.buildAuthURL('/orders'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to create order: ${errorData.message || response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const woocommerceService = new WooCommerceService();

// Also export the class for potential custom instantiation
export default WooCommerceService;
import { apiService } from './apiService';

// Define the Order type within this file
export interface Order {
  id: number;
  status: string;
  date_created: string;
  total: string;
  currency: string;
  customer_id: number; // Add customer_id field
  billing: {
    first_name: string;
    last_name: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    email: string;
    phone: string;
  };
  shipping: {
    first_name: string;
    last_name: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
  line_items: Array<{
    id: number;
    name: string;
    product_id: number;
    variation_id: number;
    quantity: number;
    tax_class: string;
    subtotal: string;
    total: string;
    sku: string;
    price: number;
  }>;
  shipping_lines: Array<{
    id: number;
    method_title: string;
    method_id: string;
    total: string;
  }>;
  payment_method: string;
  payment_method_title: string;
  customer_note: string;
}

// Define the Product type
export interface Product {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  date_created: string;
  date_modified: string;
  type: string;
  status: string;
  featured: boolean;
  catalog_visibility: string;
  description: string;
  short_description: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  date_on_sale_from: string | null;
  date_on_sale_to: string | null;
  price_html: string;
  on_sale: boolean;
  purchasable: boolean;
  total_sales: number;
  virtual: boolean;
  downloadable: boolean;
  downloads: any[];
  download_limit: number;
  download_expiry: number;
  external_url: string;
  button_text: string;
  tax_status: string;
  tax_class: string;
  manage_stock: boolean;
  stock_quantity: number | null;
  stock_status: string;
  backorders: string;
  backorders_allowed: boolean;
  backordered: boolean;
  sold_individually: boolean;
  weight: string;
  dimensions: {
    length: string;
    width: string;
    height: string;
  };
  shipping_required: boolean;
  shipping_taxable: boolean;
  shipping_class: string;
  shipping_class_id: number;
  reviews_allowed: boolean;
  average_rating: string;
  rating_count: number;
  related_ids: number[];
  upsell_ids: number[];
  cross_sell_ids: number[];
  parent_id: number;
  purchase_note: string;
  categories: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  tags: any[];
  images: Array<{
    id: number;
    date_created: string;
    date_created_gmt: string;
    date_modified: string;
    date_modified_gmt: string;
    src: string;
    name: string;
    alt: string;
  }>;
  attributes: any[];
  default_attributes: any[];
  variations: any[];
  grouped_products: any[];
  menu_order: number;
  meta_data: Array<{
    id: number;
    key: string;
    value: string;
  }>;
  wishCare?: {
    activeOffers?: string[];
    benefits?: string[];
    suitableFor?: string[];
    whatMakesItGreat?: string;
    whatMakesImages?: string[];
    howToUse?: string;
    howToImages?: string[];
    ingredients?: string;
    ingredientsImages?: string[];
    results?: string;
    resultsImages?: string[];
    pairsWith?: string;
    faqs?: Array<{
      q: string;
      a: string;
    }>;
  };
}

class WooCommerceService {
  private apiBase: string;
  private consumerKey: string;
  private consumerSecret: string;
  
  constructor() {
    // Get the base WooCommerce API URL from environment variables
    const envApiUrl = import.meta.env.VITE_WC_API_URL || import.meta.env.VITE_WP_API_URL;
    this.consumerKey = import.meta.env.VITE_WC_CONSUMER_KEY || '__MISSING_CONSUMER_KEY__';
    this.consumerSecret = import.meta.env.VITE_WC_CONSUMER_SECRET || '__MISSING_CONSUMER_SECRET__';
    
    // Check if the environment variables were actually provided (not using fallback defaults)
    const hasSetConsumerKey = 'VITE_WC_CONSUMER_KEY' in import.meta.env && import.meta.env.VITE_WC_CONSUMER_KEY !== '__MISSING_CONSUMER_KEY__';
    const hasSetConsumerSecret = 'VITE_WC_CONSUMER_SECRET' in import.meta.env && import.meta.env.VITE_WC_CONSUMER_SECRET !== '__MISSING_CONSUMER_SECRET__';
    
    // Check if using fallback default credentials
    const usingFallbackForConsumerKey = !hasSetConsumerKey;
    const usingFallbackForConsumerSecret = !hasSetConsumerSecret;
    
    if (usingFallbackForConsumerKey || usingFallbackForConsumerSecret) {
      console.warn('⚠️  WARNING: WooCommerce API credentials not configured. Please set VITE_WC_CONSUMER_KEY and VITE_WC_CONSUMER_SECRET in your .env file.');
    }
    
    // Construct the WooCommerce API base URL
    if (envApiUrl) {
      // If the URL already includes /wp-json/wc/v3, use it as is
      if (envApiUrl.includes('/wp-json/wc/v3')) {
        this.apiBase = envApiUrl;
      } 
      // If it includes /wc/v3 but not /wp-json, add wp-json part
      else if (envApiUrl.includes('/wc/v3')) {
        if (envApiUrl.startsWith('/wp-json')) {
          this.apiBase = envApiUrl;
        } else {
          this.apiBase = `/wp-json${envApiUrl}`;
        }
      }
      // If it includes /wp-json but not /wc/v3, add /wc/v3
      else if (envApiUrl.includes('/wp-json')) {
        if (envApiUrl.endsWith('/')) {
          this.apiBase = `${envApiUrl}wc/v3`;
        } else {
          this.apiBase = `${envApiUrl}/wc/v3`;
        }
      } 
      // Otherwise, construct the full path
      else if (envApiUrl.endsWith('/')) {
        this.apiBase = `${envApiUrl}wp-json/wc/v3`;
      } else {
        this.apiBase = `${envApiUrl}/wp-json/wc/v3`;
      }
    } else {
      // Default to relative path for production
      this.apiBase = '/wp-json/wc/v3';
    }
    
    console.log('WooCommerceService initialized with:');
    console.log('- API Base:', this.apiBase);
    console.log('- Consumer Key (first 10):', this.consumerKey.substring(0, 10) + '...');
    console.log('- Consumer Secret (first 10):', this.consumerSecret.substring(0, 10) + '...');
    console.log('- Using default credentials:', usingFallbackForConsumerKey || usingFallbackForConsumerSecret);
  }

  private buildAuthURL(endpoint: string): string {
    // Ensure endpoint starts with /
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    // Build the full URL with WooCommerce API base
    let baseURL = this.apiBase;
    
    // If the endpoint is already a complete WooCommerce endpoint (e.g., /products, /orders),
    // and our API base doesn't already contain /wc/v3, we need to ensure it's included.
    // But if our API base already includes /wc/v3, we should just append the endpoint.
    if (baseURL.endsWith('/wc/v3')) {
      // Our base already has /wc/v3, so just append the endpoint directly
      const fullURL = `${baseURL}${normalizedEndpoint}`;
      
      // Add authentication parameters
      const separator = fullURL.includes('?') ? '&' : '?';
      const authURL = `${fullURL}${separator}consumer_key=${this.consumerKey}&consumer_secret=${this.consumerSecret}`;
      
      console.log(`Building WooCommerce authenticated URL: ${authURL}`);
      return authURL;
    } else {
      // If our base doesn't end with /wc/v3, add it
      if (baseURL.endsWith('/')) {
        baseURL = `${baseURL}wc/v3`;
      } else {
        baseURL = `${baseURL}/wc/v3`;
      }
      
      // Append the endpoint
      const fullURL = `${baseURL}${normalizedEndpoint}`;
      
      // Add authentication parameters
      const separator = fullURL.includes('?') ? '&' : '?';
      const authURL = `${fullURL}${separator}consumer_key=${this.consumerKey}&consumer_secret=${this.consumerSecret}`;
      
      console.log(`Building WooCommerce authenticated URL: ${authURL}`);
      return authURL;
    }
  }

  // Build URL for authenticated user requests (use JWT token)
  private buildUserAuthURL(endpoint: string): string {
    // Ensure endpoint starts with /
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    // Build the full URL with WooCommerce API base
    let baseURL = this.apiBase;
    
    if (baseURL.endsWith('/wc/v3')) {
      return `${baseURL}${normalizedEndpoint}`;
    } else {
      if (baseURL.endsWith('/')) {
        baseURL = `${baseURL}wc/v3`;
      } else {
        baseURL = `${baseURL}/wc/v3`;
      }
      return `${baseURL}${normalizedEndpoint}`;
    }
  }

  // Get auth headers for authenticated requests
  private getUserAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('wp_jwt_token');
    if (token) {
      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
    }
    return { 'Content-Type': 'application/json' };
  }

  // Not needed for WooCommerce API as we use query parameters for auth
  // Keeping this for consistency with other services
  private getAuthHeaders(): Record<string, string> {
    return { 'Content-Type': 'application/json' };
  }

  // Product Methods
  async fetchProducts(): Promise<Product[]> {
    try {
      const endpoint = this.buildAuthURL('/products');
      console.log(`Fetching products from endpoint: ${endpoint}`);
      
      const response = await fetch(endpoint);
      
      console.log(`Products API response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Products API error response: ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const products: Product[] = await response.json();
      console.log(`Successfully fetched ${products.length} products`);
      return products;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  async fetchProductById(id: number, includeWishCareData: boolean = false): Promise<Product | null> {
    try {
      const endpoint = this.buildAuthURL(`/products/${id}`);
      console.log(`Fetching product ${id} from endpoint: ${endpoint}`);
      
      const response = await fetch(endpoint);
      
      console.log(`Product API response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Product API error response: ${errorText}`);
        if (response.status === 404) {
          console.log(`Product ${id} not found`);
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const product: Product = await response.json();
      console.log(`Successfully fetched product ${id}:`, product.name);
      
      // Parse WishCare metadata if requested
      if (includeWishCareData && product.meta_data) {
        const wishCareData: any = {};
        product.meta_data.forEach(meta => {
          switch (meta.key) {
            case 'wishcare_active_offers':
              try {
                wishCareData.activeOffers = JSON.parse(meta.value);
              } catch {
                wishCareData.activeOffers = [meta.value];
              }
              break;
            case 'wishcare_benefits':
              try {
                wishCareData.benefits = JSON.parse(meta.value);
              } catch {
                wishCareData.benefits = [meta.value];
              }
              break;
            case 'wishcare_suitable_for':
              try {
                wishCareData.suitableFor = JSON.parse(meta.value);
              } catch {
                wishCareData.suitableFor = [meta.value];
              }
              break;
            case 'wishcare_what_makes_it_great':
              wishCareData.whatMakesItGreat = meta.value;
              break;
            case 'wishcare_what_makes_images':
              try {
                wishCareData.whatMakesImages = JSON.parse(meta.value);
              } catch {
                wishCareData.whatMakesImages = [];
              }
              break;
            case 'wishcare_how_to_use':
              wishCareData.howToUse = meta.value;
              break;
            case 'wishcare_how_to_images':
              try {
                wishCareData.howToImages = JSON.parse(meta.value);
              } catch {
                wishCareData.howToImages = [];
              }
              break;
            case 'wishcare_ingredients':
              wishCareData.ingredients = meta.value;
              break;
            case 'wishcare_ingredients_images':
              try {
                wishCareData.ingredientsImages = JSON.parse(meta.value);
              } catch {
                wishCareData.ingredientsImages = [];
              }
              break;
            case 'wishcare_results':
              wishCareData.results = meta.value;
              break;
            case 'wishcare_results_images':
              try {
                wishCareData.resultsImages = JSON.parse(meta.value);
              } catch {
                wishCareData.resultsImages = [];
              }
              break;
            case 'wishcare_pairs_with':
              wishCareData.pairsWith = meta.value;
              break;
            case 'wishcare_faqs':
              try {
                wishCareData.faqs = JSON.parse(meta.value);
              } catch {
                wishCareData.faqs = [];
              }
              break;
          }
        });
        product.wishCare = wishCareData;
      }
      
      return product;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  async findProductBySlug(slug: string): Promise<Product | null> {
    try {
      const url = this.buildAuthURL(`/products?slug=${slug}`);
      console.log(`Finding product by slug "${slug}" from: ${url}`);
      
      const response = await fetch(url);
      
      console.log(`Find product by slug API response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Find product by slug API error response: ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const products: Product[] = await response.json();
      console.log(`Found ${products.length} products with slug "${slug}"`);
      return products.length > 0 ? products[0] : null;
    } catch (error) {
      console.error('Error finding product by slug:', error);
      throw error;
    }
  }

  async searchProducts(searchTerm: string): Promise<Product[]> {
    try {
      const encodedSearchTerm = encodeURIComponent(searchTerm);
      const endpoint = this.buildAuthURL(`/products?search=${encodedSearchTerm}`);
      console.log(`Searching products with term "${searchTerm}" from endpoint: ${endpoint}`);
      
      const response = await fetch(endpoint);
      
      console.log(`Search products API response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Search products API error response: ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const products: Product[] = await response.json();
      console.log(`Found ${products.length} products matching "${searchTerm}"`);
      return products;
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }

  async fetchProductsByCategory(categoryId: number): Promise<Product[]> {
    try {
      const endpoint = this.buildAuthURL(`/products?category=${categoryId}`);
      console.log(`Fetching products by category ${categoryId} from endpoint: ${endpoint}`);
      
      const response = await fetch(endpoint);
      
      console.log(`Products by category API response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Products by category API error response: ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const products: Product[] = await response.json();
      console.log(`Found ${products.length} products in category ${categoryId}`);
      return products;
    } catch (error) {
      console.error('Error fetching products by category:', error);
      throw error;
    }
  }

  // Order Methods
  async getCustomerOrders(customerId: number): Promise<Order[]> {
    try {
      // Check if WooCommerce is properly configured with customer ID
      if (!customerId || customerId <= 0) {
        console.warn('Customer ID is invalid for fetching orders:', customerId);
        return [];
      }
      
      // Check if we have valid API credentials before making the call
      const hasValidCredentials = this.consumerKey && this.consumerKey !== '__MISSING_CONSUMER_KEY__' &&
                                  this.consumerSecret && this.consumerSecret !== '__MISSING_CONSUMER_SECRET__';
      
      if (!hasValidCredentials) {
        console.warn('WooCommerce API credentials not properly configured. Cannot fetch customer orders.');
        return [];
      }
      
      const endpoint = this.buildAuthURL(`/orders?customer=${customerId}&per_page=50`);
      console.log(`Fetching customer orders from endpoint: ${endpoint}`);
      console.log(`Using customer ID: ${customerId}`);
      
      const response = await fetch(endpoint);
      
      console.log(`Customer orders API response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Customer orders API error response: ${errorText}`);
        // Return empty array instead of throwing to prevent errors in UI
        return [];
      }

      const orders: Order[] = await response.json();
      console.log(`Fetched ${orders.length} orders for customer ${customerId}`); // Debug log
      return orders.sort((a, b) => 
        new Date(b.date_created).getTime() - new Date(a.date_created).getTime()
      );
    } catch (error) {
      console.error('Error fetching customer orders:', error);
      // Return empty array instead of throwing to prevent UI errors
      return [];
    }
  }

  async getOrderById(orderId: number, customerId: number): Promise<Order> {
    try {
      const endpoint = this.buildAuthURL(`/orders/${orderId}?customer=${customerId}`);
      console.log(`Fetching order ${orderId} from endpoint: ${endpoint}`);
      
      const response = await fetch(endpoint);
      
      console.log(`Order API response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Order API error response: ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  }

  async createOrder(orderData: Partial<Order>): Promise<Order> {
    try {
      const endpoint = this.buildAuthURL('/orders');
      console.log(`Creating order at endpoint: ${endpoint}`);
      console.log(`Order data:`, orderData); // Debug log
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });
      
      console.log(`Create order API response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Create order API error response: ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();
      console.log(`Created order result:`, result); // Debug log
      return result;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }
}

export const woocommerceService = new WooCommerceService();
// src/services/woocommerceService.ts
import type { Product, WooCommerceAPIProduct, WooCommerceAPIProductWithWishCare, WooCommerceAPIMetaDataItem, WishCareProductData, WishCareFAQ } from "../types/product";

const WOO_API_URL = import.meta.env.VITE_WC_API_URL || 'https://your-wordpress-site.com/wp-json/wc/v3';
const WOO_CONSUMER_KEY = import.meta.env.VITE_WC_CONSUMER_KEY || '';
const WOO_CONSUMER_SECRET = import.meta.env.VITE_WC_CONSUMER_SECRET || '';

const PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPgogIDxwYXRoIGQ9Ik0yMiAydi0yYTIgMiAwIDAgMC0yLTJIMTRhMiAyIDAgMCAwLTIgMnYySDRhMiAyIDAgMCAwLTIgMnYxNGEyIDIgMCAwIDAgMiAyaDE2YTIgMiAwIDAgMCAyLTJWMnptLTQgMTZINnYtMmgxMnYyem0wLTRINnYtMmgxMnYyem0wLTRINnYtMmgxMnYyem0wLTRINnYtMmgxMnYyem0wLTRINnYtMmgxMnYyeiIgLz4KPC9zdmc+';

class WooCommerceService {
  private apiURL: string;
  private consumerKey: string;
  private consumerSecret: string;

  constructor() {
    this.apiURL = WOO_API_URL;
    this.consumerKey = WOO_CONSUMER_KEY;
    this.consumerSecret = WOO_CONSUMER_SECRET;
  }

  private buildAuthURL(endpoint: string): string {
    const separator = endpoint.includes('?') ? '&' : '?';
    if (!this.consumerKey || !this.consumerSecret) {
      return `${this.apiURL}${endpoint}`;
    }
    return `${this.apiURL}${endpoint}${separator}consumer_key=${this.consumerKey}&consumer_secret=${this.consumerSecret}`;
  }

  private parseWishCareMetaData(meta_data: WooCommerceAPIMetaDataItem[]): WishCareProductData {
    const wishCareData: WishCareProductData = {};

    meta_data.forEach(item => {
      switch (item.key) {
        case 'wishcare_active_offers':
          try {
            wishCareData.activeOffers = JSON.parse(item.value);
          } catch (e) {
            console.warn('Failed to parse wishcare_active_offers:', e);
            wishCareData.activeOffers = item.value;
          }
          break;
        case 'wishcare_benefits':
          try {
            wishCareData.benefits = JSON.parse(item.value);
          } catch (e) {
            console.warn('Failed to parse wishcare_benefits:', e);
            wishCareData.benefits = item.value;
          }
          break;
        case 'wishcare_suitable_for':
          try {
            wishCareData.suitableFor = JSON.parse(item.value);
          } catch (e) {
            console.warn('Failed to parse wishcare_suitable_for:', e);
            wishCareData.suitableFor = item.value;
          }
          break;
        case 'wishcare_what_makes_it_great':
          wishCareData.whatMakesItGreat = item.value;
          break;
        case 'wishcare_what_makes_images':
          try {
            wishCareData.whatMakesImages = JSON.parse(item.value);
          } catch (e) {
            console.warn('Failed to parse wishcare_what_makes_images:', e);
            wishCareData.whatMakesImages = item.value;
          }
          break;
        case 'wishcare_how_to_use':
          wishCareData.howToUse = item.value;
          break;
        case 'wishcare_how_to_images':
          try {
            wishCareData.howToImages = JSON.parse(item.value);
          } catch (e) {
            console.warn('Failed to parse wishcare_how_to_images:', e);
            wishCareData.howToImages = item.value;
          }
          break;
        case 'wishcare_ingredients':
          wishCareData.ingredients = item.value;
          break;
        case 'wishcare_ingredients_images':
          try {
            wishCareData.ingredientsImages = JSON.parse(item.value);
          } catch (e) {
            console.warn('Failed to parse wishcare_ingredients_images:', e);
            wishCareData.ingredientsImages = item.value;
          }
          break;
        case 'wishcare_results':
          wishCareData.results = item.value;
          break;
        case 'wishcare_results_images':
          try {
            wishCareData.resultsImages = JSON.parse(item.value);
          } catch (e) {
            console.warn('Failed to parse wishcare_results_images:', e);
            wishCareData.resultsImages = item.value;
          }
          break;
        case 'wishcare_pairs_with':
          wishCareData.pairsWith = item.value;
          break;
        case 'wishcare_faqs':
          try {
            wishCareData.faqs = JSON.parse(item.value);
          } catch (e) {
            console.warn('Failed to parse wishcare_faqs:', e);
            wishCareData.faqs = item.value;
          }
          break;
      }
    });

    return wishCareData;
  }

  private async fetchProductMeta(productId: number): Promise<WishCareProductData> {
    // Meta data is included in the main product response in WooCommerce API
    // This method is kept for compatibility but should not be called separately
    // Meta data should be extracted from the main product response
    console.warn('fetchProductMeta should not be called directly. Meta data is included in the product response.');
    return {};
  }

  private transformWooCommerceProduct(product: WooCommerceAPIProduct, wishCareData?: WishCareProductData): Product {
    return {
      id: product.id,
      name: product.name,
      price: product.price || '0.00',
      regular_price: product.regular_price,
      sale_price: product.sale_price,
      images: product.images && product.images.length > 0 
        ? product.images.map(img => ({ src: img.src, alt: img.alt })) 
        : [{ src: PLACEHOLDER_IMAGE }],
      description: product.description || 'No description available',
      short_description: product.short_description || product.description || 'No description available',
      stock_quantity: product.stock_quantity,
      stock_status: product.stock_status,
      categories: product.categories || [],
      wishCare: wishCareData,
    };
  }

  async fetchProducts(): Promise<Product[]> {
    try {
      const response = await fetch(this.buildAuthURL('/products'));
      
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
      }
      
      const products: WooCommerceAPIProduct[] = await response.json();
      
      return products.map(product => this.transformWooCommerceProduct(product));
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }

  async fetchProductById(id: number, includeWishCare: boolean = true): Promise<Product | null> {
    try {
      const response = await fetch(this.buildAuthURL(`/products/${id}`));
      
      if (!response.ok) {
        throw new Error(`Failed to fetch product: ${response.status} ${response.statusText}`);
      }
      
      const product: WooCommerceAPIProduct = await response.json();
      
      let wishCareData = {};
      if (includeWishCare && product.meta_data) {
        // Extract WishCare meta data from the main product response
        wishCareData = this.parseWishCareMetaData(product.meta_data);
      }
      
      return this.transformWooCommerceProduct(product, wishCareData);
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  }

  async fetchProductsByCategory(categoryId: number): Promise<Product[]> {
    try {
      const response = await fetch(this.buildAuthURL(`/products?category=${categoryId}`));
      
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
      }
      
      const products: WooCommerceAPIProduct[] = await response.json();
      
      return products.map(product => this.transformWooCommerceProduct(product));
    } catch (error) {
      console.error('Error fetching products by category:', error);
      return [];
    }
  }

  async searchProducts(searchTerm: string): Promise<Product[]> {
    try {
      const response = await fetch(this.buildAuthURL(`/products?search=${encodeURIComponent(searchTerm)}`));
      
      if (!response.ok) {
        throw new Error(`Failed to search products: ${response.status} ${response.statusText}`);
      }
      
      const products: WooCommerceAPIProduct[] = await response.json();
      
      return products.map(product => this.transformWooCommerceProduct(product));
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }
}

export const woocommerceService = new WooCommerceService();
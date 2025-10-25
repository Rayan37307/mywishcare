// Meta data item interface for WooCommerce API
export interface WooCommerceAPIMetaDataItem {
  id: number;
  key: string;
  value: string;
}

export interface WooCommerceAPIProduct {
  id: number;
  name: string;
  slug: string; // Add slug field
  price: string;
  regular_price: string;
  sale_price: string;
  images: Array<{
    id: number;
    src: string;
    name: string;
    alt: string;
  }>;
  description: string;
  short_description: string;
  stock_quantity: number | null;
  manage_stock: boolean;
  stock_status: 'instock' | 'outofstock' | 'onbackorder';
  categories: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  meta_data?: WooCommerceAPIMetaDataItem[];
}
``
// Extended product interface with WishCare data
export interface WooCommerceAPIProductWithWishCare extends WooCommerceAPIProduct {
  meta_data: WooCommerceAPIMetaDataItem[];
}

// WishCare FAQ interface
export interface WishCareFAQ {
  q: string;
  a: string;
}

// WishCare product data interface
export interface WishCareProductData {
  activeOffers?: string[];
  benefits?: string[];
  suitableFor?: string[];
  whatMakesItGreat?: string;
  whatMakesImages?: number[];
  howToUse?: string;
  howToImages?: number[];
  ingredients?: string;
  ingredientsImages?: number[];
  results?: string;
  resultsImages?: number[];
  pairsWith?: string;
  faqs?: WishCareFAQ[];
}

// Extended Product interface with WishCare data
export interface Product {
  id: number;
  name: string;
  slug: string; // Add slug field
  price: string;
  regular_price?: string;
  sale_price?: string;
  images: { src: string; alt?: string }[];
  description: string;
  short_description: string;
  stock_quantity: number | null;
  stock_status: 'instock' | 'outofstock' | 'onbackorder';
  categories: Array<{ id: number; name: string }>;
  wishCare?: WishCareProductData;
}

export interface WooCommerceAPIProduct {
  id: number;
  name: string;
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
}

export interface Product {
  id: number;
  name: string;
  price: string;
  regular_price?: string;
  sale_price?: string;
  images: { src: string; alt?: string }[];
  description: string;
  short_description: string;
  stock_quantity: number | null;
  stock_status: 'instock' | 'outofstock' | 'onbackorder';
  categories: Array<{ id: number; name: string }>;
}
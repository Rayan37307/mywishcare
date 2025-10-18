// src/store/productStore.ts
import { create } from 'zustand';
import { woocommerceService } from '../services/woocommerceService';
import type { Product } from '../types/product';

interface ProductState {
  products: Product[];
  whatsNewProducts: Product[];
  bestSellingProducts: Product[];
  routineBuilderProducts: Product[];
  loading: boolean;
  error: string | null;
  fetchAllProducts: () => Promise<void>;
  fetchWhatsNewProducts: () => Promise<void>;
  fetchBestSellingProducts: () => Promise<void>;
  fetchRoutineBuilderProducts: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  // Add individual product methods
  fetchProductById: (id: number) => Promise<Product | null>;
  // Add search functionality
  searchProducts: (query: string) => Promise<Product[]>;
  // Add category filtering
  fetchProductsByCategory: (categoryId: number) => Promise<void>;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  whatsNewProducts: [],
  bestSellingProducts: [],
  routineBuilderProducts: [],
  loading: false,
  error: null,
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
  
  fetchAllProducts: async () => {
    set({ loading: true, error: null });
    try {
      const products = await woocommerceService.fetchProducts();
      set({ 
        products,
        loading: false 
      });
    } catch (error) {
      set({ 
        error: 'Failed to fetch products', 
        loading: false 
      });
    }
  },
  
  fetchWhatsNewProducts: async () => {
    set({ loading: true, error: null });
    try {
      const products = await woocommerceService.fetchProducts();
      // Sort by date_created to get newest products (WooCommerce API returns this)
      // For now, just take the first 6 as you have
      const newProducts = products.slice(0, 6);
      set({ 
        whatsNewProducts: newProducts,
        loading: false 
      });
    } catch (error) {
      set({ 
        error: 'Failed to fetch "What\'s New" products', 
        loading: false 
      });
    }
  },
  
  fetchBestSellingProducts: async () => {
    set({ loading: true, error: null });
    try {
      // In a real implementation, you might:
      // 1. Use WooCommerce reports API to get actual bestsellers
      // 2. Create a specific tag/category for bestsellers
      // 3. Sort by a custom meta field
      const products = await woocommerceService.fetchProducts();
      
      // For now, you could add a custom sort if you have meta data
      // Or just take first 6 as placeholder
      const bestSelling = products.slice(0, 6);
      set({ 
        bestSellingProducts: bestSelling,
        loading: false 
      });
    } catch (error) {
      set({ 
        error: 'Failed to fetch best selling products', 
        loading: false 
      });
    }
  },
  
  fetchRoutineBuilderProducts: async () => {
    set({ loading: true, error: null });
    try {
      // You might want to filter by a specific category/tag for routine builder products
      const products = await woocommerceService.fetchProducts();
      const routineBuilderProducts = products.slice(0, 6);
      set({ 
        routineBuilderProducts: routineBuilderProducts,
        loading: false 
      });
    } catch (error) {
      set({ 
        error: 'Failed to fetch Routine Builder products', 
        loading: false 
      });
    }
  },

  // Add individual product fetching
  fetchProductById: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const product = await woocommerceService.fetchProductById(id, true); // Include WishCare data
      set({ loading: false });
      return product;
    } catch (error) {
      set({ 
        error: 'Failed to fetch product', 
        loading: false 
      });
      return null;
    }
  },

  // Add search functionality
  searchProducts: async (query: string) => {
    set({ loading: true, error: null });
    try {
      const products = await woocommerceService.searchProducts(query);
      set({ loading: false });
      return products;
    } catch (error) {
      set({ 
        error: 'Failed to search products', 
        loading: false 
      });
      return [];
    }
  },

  // Add category filtering
  fetchProductsByCategory: async (categoryId: number) => {
    set({ loading: true, error: null });
    try {
      const products = await woocommerceService.fetchProductsByCategory(categoryId);
      set({ 
        products,
        loading: false 
      });
    } catch (error) {
      set({ 
        error: 'Failed to fetch products by category', 
        loading: false 
      });
    }
  },
}));
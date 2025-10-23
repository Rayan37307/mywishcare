// src/store/productStore.ts
import { create } from 'zustand';
import { woocommerceService } from '../services/woocommerceService';
import type { Product } from '../types/product';

export type CollectionType = 
  | 'acne' 
  | 'pigmentation' 
  | 'hairfall' 
  | 'dullSkin' 
  | 'detan' 
  | 'damagedHair' 
  | 'allProducts'
  | 'sunCare'
  | 'bestSellers';

interface ProductState {
  products: Product[];
  whatsNewProducts: Product[];
  bestSellingProducts: Product[];
  routineBuilderProducts: Product[];
  acneProducts: Product[];
  pigmentationProducts: Product[];
  hairfallProducts: Product[];
  dullSkinProducts: Product[];
  detanProducts: Product[];
  damagedHairProducts: Product[];
  sunCareProducts: Product[];
  allProducts: Product[];
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
  // Collection-specific functions
  fetchAcneProducts: () => Promise<void>;
  fetchPigmentationProducts: () => Promise<void>;
  fetchHairfallProducts: () => Promise<void>;
  fetchDullSkinProducts: () => Promise<void>;
  fetchDetanProducts: () => Promise<void>;
  fetchDamagedHairProducts: () => Promise<void>;
  fetchSunCareProducts: () => Promise<void>;
  fetchAllProductsCollection: () => Promise<void>;
  getProductsByCollection: (collection: CollectionType) => Product[];
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  whatsNewProducts: [],
  bestSellingProducts: [],
  routineBuilderProducts: [],
  acneProducts: [],
  pigmentationProducts: [],
  hairfallProducts: [],
  dullSkinProducts: [],
  detanProducts: [],
  damagedHairProducts: [],
  sunCareProducts: [],
  allProducts: [],
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
    } catch {
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
    } catch {
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
    } catch {
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
    } catch {
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
    } catch {
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
    } catch {
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
    } catch {
      set({ 
        error: 'Failed to fetch products by category', 
        loading: false 
      });
    }
  },
  
  // Collection-specific functions
  fetchAcneProducts: async () => {
    set({ loading: true, error: null });
    try {
      // In a real implementation, you would filter by specific category/tag for acne products
      const products = await woocommerceService.fetchProducts();
      // Filter products that belong to acne category (this is example - implement based on your actual data structure)
      const acneProducts = products.filter(product => 
        product.categories.some(cat => 
          cat.name.toLowerCase().includes('acne') || 
          product.name.toLowerCase().includes('acne') ||
          product.short_description.toLowerCase().includes('acne')
        )
      );
      set({ 
        acneProducts: acneProducts,
        loading: false 
      });
    } catch {
      set({ 
        error: 'Failed to fetch acne products', 
        loading: false 
      });
    }
  },
  
  fetchPigmentationProducts: async () => {
    set({ loading: true, error: null });
    try {
      const products = await woocommerceService.fetchProducts();
      const pigmentationProducts = products.filter(product => 
        product.categories.some(cat => 
          cat.name.toLowerCase().includes('pigmentation') || 
          product.name.toLowerCase().includes('pigmentation') ||
          product.short_description.toLowerCase().includes('pigmentation')
        )
      );
      set({ 
        pigmentationProducts: pigmentationProducts,
        loading: false 
      });
    } catch {
      set({ 
        error: 'Failed to fetch pigmentation products', 
        loading: false 
      });
    }
  },
  
  fetchHairfallProducts: async () => {
    set({ loading: true, error: null });
    try {
      const products = await woocommerceService.fetchProducts();
      const hairfallProducts = products.filter(product => 
        product.categories.some(cat => 
          cat.name.toLowerCase().includes('hairfall') || 
          product.name.toLowerCase().includes('hairfall') ||
          product.short_description.toLowerCase().includes('hairfall')
        )
      );
      set({ 
        hairfallProducts: hairfallProducts,
        loading: false 
      });
    } catch {
      set({ 
        error: 'Failed to fetch hairfall products', 
        loading: false 
      });
    }
  },
  
  fetchDullSkinProducts: async () => {
    set({ loading: true, error: null });
    try {
      const products = await woocommerceService.fetchProducts();
      const dullSkinProducts = products.filter(product => 
        product.categories.some(cat => 
          cat.name.toLowerCase().includes('dull') || 
          product.name.toLowerCase().includes('dull') ||
          product.short_description.toLowerCase().includes('dull')
        )
      );
      set({ 
        dullSkinProducts: dullSkinProducts,
        loading: false 
      });
    } catch {
      set({ 
        error: 'Failed to fetch dull skin products', 
        loading: false 
      });
    }
  },
  
  fetchDetanProducts: async () => {
    set({ loading: true, error: null });
    try {
      const products = await woocommerceService.fetchProducts();
      const detanProducts = products.filter(product => 
        product.categories.some(cat => 
          cat.name.toLowerCase().includes('detan') || 
          product.name.toLowerCase().includes('detan') ||
          product.short_description.toLowerCase().includes('detan')
        )
      );
      set({ 
        detanProducts: detanProducts,
        loading: false 
      });
    } catch {
      set({ 
        error: 'Failed to fetch detan products', 
        loading: false 
      });
    }
  },
  
  fetchDamagedHairProducts: async () => {
    set({ loading: true, error: null });
    try {
      const products = await woocommerceService.fetchProducts();
      const damagedHairProducts = products.filter(product => 
        product.categories.some(cat => 
          cat.name.toLowerCase().includes('damaged') || 
          product.name.toLowerCase().includes('damaged') ||
          product.short_description.toLowerCase().includes('damaged')
        )
      );
      set({ 
        damagedHairProducts: damagedHairProducts,
        loading: false 
      });
    } catch {
      set({ 
        error: 'Failed to fetch damaged hair products', 
        loading: false 
      });
    }
  },
  
  fetchSunCareProducts: async () => {
    set({ loading: true, error: null });
    try {
      const products = await woocommerceService.fetchProducts();
      const sunCareProducts = products.filter(product => 
        product.categories.some(cat => 
          cat.name.toLowerCase().includes('sun') || 
          product.name.toLowerCase().includes('sun') ||
          product.short_description.toLowerCase().includes('sun') ||
          product.categories.some(cat => cat.name.toLowerCase().includes('sun'))
        )
      );
      set({ 
        sunCareProducts: sunCareProducts,
        loading: false 
      });
    } catch {
      set({ 
        error: 'Failed to fetch sun care products', 
        loading: false 
      });
    }
  },
  
  fetchAllProductsCollection: async () => {
    set({ loading: true, error: null });
    try {
      const products = await woocommerceService.fetchProducts();
      set({ 
        allProducts: products,
        loading: false 
      });
    } catch {
      set({ 
        error: 'Failed to fetch all products collection', 
        loading: false 
      });
    }
  },
  
  getProductsByCollection: (collection: CollectionType) => {
    const state = get();
    switch(collection) {
      case 'acne':
        return state.acneProducts;
      case 'pigmentation':
        return state.pigmentationProducts;
      case 'hairfall':
        return state.hairfallProducts;
      case 'dullSkin':
        return state.dullSkinProducts;
      case 'detan':
        return state.detanProducts;
      case 'damagedHair':
        return state.damagedHairProducts;
      case 'sunCare':
        return state.sunCareProducts;
      case 'allProducts':
        return state.allProducts;
      case 'bestSellers':
        return state.bestSellingProducts;
      default:
        return state.products;
    }
  }
}));
// src/store/productStore.ts
import { create } from 'zustand';
import { woocommerceService } from '../services/woocommerceService';
import type { Product } from '../types/product';
import { COLLECTIONS } from '../constants/app';

export type CollectionType = 
  | typeof COLLECTIONS.ACNE 
  | typeof COLLECTIONS.PIGMENTATION
  | typeof COLLECTIONS.HAIRFALL 
  | typeof COLLECTIONS.DULL_SKIN
  | typeof COLLECTIONS.DETAN
  | typeof COLLECTIONS.DAMAGED_HAIR
  | typeof COLLECTIONS.DANDRUFF
  | 'allProducts'
  | typeof COLLECTIONS.SUN_CARE
  | 'bestSellers'
  | 'lipBalm'
  | 'routineBuilder'
  | 'whatsNew'
  | 'hairCare1';

interface ProductState {
  products: Product[];
  whatsNewProducts: Product[];
  bestSellingProducts: Product[];
  routineBuilderProducts: Product[];
  lipBalmProducts: Product[];
  hairCare1Products: Product[];
  acneProducts: Product[];
  pigmentationProducts: Product[];
  hairfallProducts: Product[];
  dandruffProducts: Product[];
  dullSkinProducts: Product[];
  detanProducts: Product[];
  damagedHairProducts: Product[];
  sunCareProducts: Product[];
  allProducts: Product[];
  slugToIdMap: Record<string, number>; // Map from slug to product ID for efficient lookup
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
  fetchProductBySlug: (slug: string) => Promise<Product | null>;
  // Add search functionality
  searchProducts: (query: string) => Promise<Product[]>;
  // Add category filtering
  fetchProductsByCategory: (categoryId: number) => Promise<void>;
  fetchProductsByTag: (tagId: number) => Promise<void>;
  fetchProductsByTagSlug: (tagSlug: string) => Promise<void>;
  // Collection-specific functions
  fetchLipBalmProducts: () => Promise<void>;
  fetchHairCare1Products: () => Promise<void>;
  fetchAcneProducts: () => Promise<void>;
  fetchPigmentationProducts: () => Promise<void>;
  fetchHairfallProducts: () => Promise<void>;
  fetchDandruffProducts: () => Promise<void>;
  fetchDullSkinProducts: () => Promise<void>;
  fetchDetanProducts: () => Promise<void>;
  fetchDamagedHairProducts: () => Promise<void>;
  fetchSunCareProducts: () => Promise<void>;
  fetchAllProductsCollection: () => Promise<void>;
  getProductsByCollection: (collection: CollectionType) => Product[];
  getProductById: (id: number) => Product | null;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  whatsNewProducts: [],
  bestSellingProducts: [],
  routineBuilderProducts: [],
  lipBalmProducts: [],
  hairCare1Products: [],
  acneProducts: [],
  pigmentationProducts: [],
  hairfallProducts: [],
  dandruffProducts: [],
  dullSkinProducts: [],
  detanProducts: [],
  damagedHairProducts: [],
  sunCareProducts: [],
  allProducts: [],
  slugToIdMap: {},
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
      // Fetch products ordered by date (newest first) - using woocommerce API parameter
      const products = await woocommerceService.fetchProductsByOrder('date', 'desc');
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
      // Fetch best selling products by ordering by popularity
      const products = await woocommerceService.fetchBestSellingProducts();
      set({ 
        bestSellingProducts: products,
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
      // Fetch products by 'routine-builder' tag
      const products = await woocommerceService.fetchProductsByTagSlug('routine-builder');
      set({ 
        routineBuilderProducts: products,
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

  fetchProductBySlug: async (slug: string) => {
    set({ loading: true, error: null });
    try {
      // First try to find product by slug
      let product = await woocommerceService.findProductBySlug(slug);
      
      // If not found and slug is numeric, try fetching by ID
      if (!product && /^\d+$/.test(slug)) {
        const productId = parseInt(slug, 10);
        product = await woocommerceService.fetchProductById(productId, true);
      }
      
      if (product) {
        set({ loading: false });
        return product;
      } else {
        set({ 
          error: 'Product not found', 
          loading: false 
        });
        return null;
      }
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
  
  // Add tag filtering
  fetchProductsByTag: async (tagId: number) => {
    set({ loading: true, error: null });
    try {
      const products = await woocommerceService.fetchProductsByTag(tagId);
      set({ 
        products,
        loading: false 
      });
    } catch {
      set({ 
        error: 'Failed to fetch products by tag', 
        loading: false 
      });
    }
  },
  
  fetchProductsByTagSlug: async (tagSlug: string) => {
    set({ loading: true, error: null });
    try {
      const products = await woocommerceService.fetchProductsByTagSlug(tagSlug);
      set({ 
        products,
        loading: false 
      });
    } catch {
      set({ 
        error: 'Failed to fetch products by tag slug', 
        loading: false 
      });
    }
  },
  
  // Collection-specific functions
  fetchLipBalmProducts: async () => {
    set({ loading: true, error: null });
    try {
      const products = await woocommerceService.fetchProductsByTagSlug('lip-balm');
      set({ 
        lipBalmProducts: products,
        loading: false 
      });
    } catch {
      set({ 
        error: 'Failed to fetch lip balm products', 
        loading: false 
      });
    }
  },
  
  fetchHairCare1Products: async () => {
    set({ loading: true, error: null });
    try {
      const products = await woocommerceService.fetchProductsByTagSlug('hair-care-1');
      set({ 
        hairCare1Products: products,
        loading: false 
      });
    } catch {
      set({ 
        error: 'Failed to fetch Hair Care 1 products', 
        loading: false 
      });
    }
  },
  
  fetchAcneProducts: async () => {
    set({ loading: true, error: null });
    try {
      // In a real implementation, you would fetch by specific tag ID for acne products
      // For now, using tag slug - you would replace 'acne' with the actual tag slug in your WooCommerce store
      const products = await woocommerceService.fetchProductsByTagSlug('acne');
      set({ 
        acneProducts: products,
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
      const products = await woocommerceService.fetchProductsByTagSlug('pigmentation');
      set({ 
        pigmentationProducts: products,
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
      const products = await woocommerceService.fetchProductsByTagSlug('hairfall');
      set({ 
        hairfallProducts: products,
        loading: false 
      });
    } catch {
      set({ 
        error: 'Failed to fetch hairfall products', 
        loading: false 
      });
    }
  },
  
  fetchDandruffProducts: async () => {
    set({ loading: true, error: null });
    try {
      const products = await woocommerceService.fetchProductsByTagSlug('dandruff');
      set({ 
        dandruffProducts: products,
        loading: false 
      });
    } catch {
      set({ 
        error: 'Failed to fetch dandruff products', 
        loading: false 
      });
    }
  },
  
  fetchDullSkinProducts: async () => {
    set({ loading: true, error: null });
    try {
      const products = await woocommerceService.fetchProductsByTagSlug('dull-skin');
      set({ 
        dullSkinProducts: products,
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
      const products = await woocommerceService.fetchProductsByTagSlug('detan');
      set({ 
        detanProducts: products,
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
      const products = await woocommerceService.fetchProductsByTagSlug('damaged-hair');
      set({ 
        damagedHairProducts: products,
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
      const products = await woocommerceService.fetchProductsByTagSlug('sun-care');
      set({ 
        sunCareProducts: products,
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
      // Fetch all products (no specific tag filter)
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
      case COLLECTIONS.ACNE:
        return state.acneProducts;
      case COLLECTIONS.PIGMENTATION:
        return state.pigmentationProducts;
      case COLLECTIONS.HAIRFALL:
        return state.hairfallProducts;
      case COLLECTIONS.DANDRUFF:
        return state.dandruffProducts;
      case COLLECTIONS.DULL_SKIN:
        return state.dullSkinProducts;
      case COLLECTIONS.DETAN:
        return state.detanProducts;
      case COLLECTIONS.DAMAGED_HAIR:
        return state.damagedHairProducts;
      case COLLECTIONS.SUN_CARE:
        return state.sunCareProducts;
      case 'lipBalm':
        return state.lipBalmProducts;
      case 'routineBuilder':
        return state.routineBuilderProducts;
      case 'whatsNew':
        return state.whatsNewProducts;
      case 'hairCare1':
        return state.hairCare1Products;
      case 'allProducts':
        return state.allProducts;
      case 'bestSellers':
        return state.bestSellingProducts;
      default:
        return state.products;
    }
  },
  
  // Optimized selector to get a single product by ID from any collection
  getProductById: (id: number) => {
    const state = get();
    // Check all collections in order of likelihood to find the product
    const collectionsToSearch: Product[][] = [
      state.products,
      state.bestSellingProducts,
      state.whatsNewProducts,
      state.allProducts,
      state.acneProducts,
      state.pigmentationProducts,
      state.hairfallProducts,
      state.dandruffProducts,
      state.dullSkinProducts,
      state.detanProducts,
      state.damagedHairProducts,
      state.sunCareProducts,
      state.lipBalmProducts,
      state.routineBuilderProducts,
      state.hairCare1Products
    ];
    
    for (const collection of collectionsToSearch) {
      const product = collection.find(p => p.id === id);
      if (product) return product;
    }
    
    return null;
  }
}));
import { useMemo } from 'react';
import { useProductStore } from '../store/productStore';

// Custom hook for optimized product access
export const useOptimizedProducts = (collectionType?: string) => {
  const {
    products,
    bestSellingProducts,
    whatsNewProducts,
    acneProducts,
    pigmentationProducts,
    hairfallProducts,
    dullSkinProducts,
    detanProducts,
    damagedHairProducts,
    sunCareProducts,
    lipBalmProducts,
    routineBuilderProducts,
    hairCare1Products,
    allProducts,
    loading
  } = useProductStore();

  // Memoize product data based on collection type
  const memoizedProducts = useMemo(() => {
    if (!collectionType) return { products, loading };
    
    switch (collectionType) {
      case 'bestSellers':
        return { products: bestSellingProducts, loading };
      case 'whatsNew':
        return { products: whatsNewProducts, loading };
      case 'acne':
        return { products: acneProducts, loading };
      case 'pigmentation':
        return { products: pigmentationProducts, loading };
      case 'hairfall':
        return { products: hairfallProducts, loading };
      case 'dullSkin':
        return { products: dullSkinProducts, loading };
      case 'detan':
        return { products: detanProducts, loading };
      case 'damagedHair':
        return { products: damagedHairProducts, loading };
      case 'sunCare':
        return { products: sunCareProducts, loading };
      case 'lipBalm':
        return { products: lipBalmProducts, loading };
      case 'routineBuilder':
        return { products: routineBuilderProducts, loading };
      case 'hairCare1':
        return { products: hairCare1Products, loading };
      case 'all':
        return { products: allProducts, loading };
      default:
        return { products, loading };
    }
  }, [
    collectionType,
    products,
    bestSellingProducts,
    whatsNewProducts,
    acneProducts,
    pigmentationProducts,
    hairfallProducts,
    dullSkinProducts,
    detanProducts,
    damagedHairProducts,
    sunCareProducts,
    lipBalmProducts,
    routineBuilderProducts,
    hairCare1Products,
    allProducts,
    loading
  ]);

  return memoizedProducts;
};

// Custom hook for optimized single product access
export const useOptimizedProduct = (id: number) => {
  const { getProductById } = useProductStore();

  // Memoize the product lookup to prevent unnecessary recalculations
  const product = useMemo(() => {
    return getProductById(id);
  }, [id, getProductById]);

  const loading = product === null && id !== undefined;

  return { product, loading };
};
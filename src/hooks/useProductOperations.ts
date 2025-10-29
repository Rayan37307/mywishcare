import { useProductStore } from '../store/productStore';
import type { CollectionType } from '../store/productStore';
import { COLLECTIONS } from '../constants/app';

// Custom hook to encapsulate product operations
export const useProductOperations = () => {
  const { 
    fetchAllProducts,
    fetchWhatsNewProducts,
    fetchBestSellingProducts,
    fetchRoutineBuilderProducts,
    fetchProductById,
    fetchProductBySlug,
    searchProducts,
    fetchAcneProducts,
    fetchPigmentationProducts,
    fetchHairfallProducts,
    fetchDullSkinProducts,
    fetchDetanProducts,
    fetchDamagedHairProducts,
    fetchSunCareProducts,
    fetchLipBalmProducts,
    fetchHairCare1Products,
    fetchAllProductsCollection,
    getProductsByCollection,
    loading,
    error
  } = useProductStore();

  // Fetch products by collection type
  const fetchProductsByCollection = async (collection: CollectionType) => {
    switch(collection) {
      case COLLECTIONS.ACNE:
        return await fetchAcneProducts();
      case COLLECTIONS.PIGMENTATION:
        return await fetchPigmentationProducts();
      case COLLECTIONS.HAIRFALL:
        return await fetchHairfallProducts();
      case COLLECTIONS.DULL_SKIN:
        return await fetchDullSkinProducts();
      case COLLECTIONS.DETAN:
        return await fetchDetanProducts();
      case COLLECTIONS.DAMAGED_HAIR:
        return await fetchDamagedHairProducts();
      case COLLECTIONS.SUN_CARE:
        return await fetchSunCareProducts();
      case 'lipBalm':
        return await fetchLipBalmProducts();
      case 'routineBuilder':
        return await fetchRoutineBuilderProducts();
      case 'whatsNew':
        return await fetchWhatsNewProducts();
      case 'hairCare1':
        return await fetchHairCare1Products();
      case 'allProducts':
        return await fetchAllProductsCollection();
      case 'bestSellers':
        return await fetchBestSellingProducts();
      default:
        return await fetchAllProducts();
    }
  };

  return {
    // Fetching functions
    fetchAllProducts,
    fetchWhatsNewProducts,
    fetchBestSellingProducts,
    fetchRoutineBuilderProducts,
    fetchProductById,
    fetchProductBySlug,
    searchProducts,
    fetchProductsByCollection,
    
    // Collection fetching functions
    fetchAcneProducts,
    fetchPigmentationProducts,
    fetchHairfallProducts,
    fetchDullSkinProducts,
    fetchDetanProducts,
    fetchDamagedHairProducts,
    fetchSunCareProducts,
    fetchLipBalmProducts,
    fetchHairCare1Products,
    fetchAllProductsCollection,
    
    // Helper functions
    getProductsByCollection,
    
    // Status
    loading,
    error,
  };
};
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { COLLECTIONS } from '../constants/app';
import ProductCard from '../components/ProductCard';
import type { Product } from '../types/product';
import { woocommerceService } from '../services/woocommerceService';

const CollectionBySlug = () => {
  const { slug } = useParams<{ slug: string }>();
  const { addItem } = useCartStore();
  const [collectionProducts, setCollectionProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      // Fetch products by the category slug using woocommerce service directly
      const fetchCollectionProducts = async () => {
        setLoading(true);
        setError(null);
        try {
          const products = await woocommerceService.fetchProductsByCategorySlug(slug);
          setCollectionProducts(products);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to fetch collection products');
        } finally {
          setLoading(false);
        }
      };
      
      fetchCollectionProducts();
    }
  }, [slug]);

  // Capitalize first letter of each word in the slug for display
  const capitalizeWords = (str: string) => {
    return str
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Get the actual collection title from slug
  const getCollectionTitle = () => {
    if (!slug) return '';
    
    switch(slug.toLowerCase()) {
      case COLLECTIONS.BESTSELLERS:
        return 'Best Sellers';
      case COLLECTIONS.SUN_CARE:
        return 'Sun Care';
      case COLLECTIONS.LIP_BALM:
        return 'Lip Balm';
      case COLLECTIONS.HAIRFALL:
        return 'Hair Fall';
      case COLLECTIONS.ACNE:
        return 'Acne';
      case COLLECTIONS.PIGMENTATION:
        return 'Pigmentation';
      case COLLECTIONS.DANDRUFF:
        return 'Dandruff';
      case COLLECTIONS.DULL_SKIN:
        return 'Dull Skin';
      case COLLECTIONS.DETAN:
        return 'De-tan';
      case COLLECTIONS.DAMAGED_HAIR:
        return 'Damaged Hair';
      case COLLECTIONS.ALL_PRODUCTS:
        return 'All Products';
      default:
        return capitalizeWords(slug);
    }
  };

  return (
    <div className="md:px-10 max-md:px-4 pb-10">
      <h1 className="text-2xl font-bold mb-6 capitalize">{getCollectionTitle()}</h1>
      
      {error && (
        <div className="text-red-500 text-center py-10">
          <p>Error loading collection: {error}</p>
        </div>
      )}
      
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg overflow-hidden p-2">
              <div className="animate-pulse bg-gray-200 aspect-[5/5.5] rounded-lg w-full" />
              <div className="text-center mt-2">
                <div className="animate-pulse bg-gray-200 h-4 w-3/4 mx-auto mb-2 rounded" />
                <div className="animate-pulse bg-gray-200 h-3 w-full mx-auto mb-3 rounded" />
                <div className="animate-pulse bg-gray-200 h-8 w-full rounded-md mb-2" />
              </div>
            </div>
          ))}
        </div>
      ) : collectionProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {collectionProducts.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onAddToCart={addItem} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p>No products found in this collection.</p>
        </div>
      )}
    </div>
  );
};

export default CollectionBySlug;
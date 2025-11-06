import { useState, useEffect } from 'react';
import type { Product } from '../types/product';
import { Link } from 'react-router-dom';
import { useProductStore } from '../store/productStore';
import { useCartStore } from '../store/cartStore';
import Skeleton from './Skeleton';

const RECENTLY_VIEWED_KEY = 'recentlyViewedProducts';

interface RecentlyViewedProductsProps {
  currentProductId: number;
}

const RecentlyViewedProducts = ({ currentProductId }: RecentlyViewedProductsProps) => {
  const { fetchProductById } = useProductStore();
  const { addItem, isAddingItem } = useCartStore();
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<number[]>([]);
  const [recentlyViewedProducts, setRecentlyViewedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Add current product to recently viewed
    addToRecentlyViewed(currentProductId);
    
    // Add current product to recently viewed
    addToRecentlyViewed(currentProductId);
    
    // Now load the filtered IDs (excluding current product) to show in the UI
    const storedAfterUpdate = localStorage.getItem(RECENTLY_VIEWED_KEY);
    if (storedAfterUpdate) {
      const updatedIds = JSON.parse(storedAfterUpdate);
      // Remove the current product ID and keep only unique values
      const filtered = [...new Set(updatedIds.filter((id: number) => id !== currentProductId))] as number[];
      setRecentlyViewedIds(filtered);
    } else {
      setRecentlyViewedIds([]);
    }
    
    setLoading(false);
  }, [currentProductId]);

  useEffect(() => {
    // Fetch product details for each recently viewed ID
    const fetchProducts = async () => {
      if (recentlyViewedIds.length > 0) {
        try {
          const products = await Promise.all(
            recentlyViewedIds.map(id => fetchProductById(id))
          );
          setRecentlyViewedProducts(products.filter(Boolean) as Product[]);
        } catch (error) {
          console.error('Error fetching recently viewed products:', error);
        }
      }
    };

    fetchProducts();
  }, [recentlyViewedIds, fetchProductById]);

  const addToRecentlyViewed = (productId: number) => {
    const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
    let ids: number[] = stored ? JSON.parse(stored) : [];
    
    // Remove the product if it already exists to move it to the front
    ids = ids.filter(id => id !== productId);
    
    // Add the new product to the beginning
    ids.unshift(productId);
    
    // Keep only the last 10 viewed products
    ids = ids.slice(0, 10);
    
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(ids));
  };

  const handleAddToCart = (product: Product) => {
    addItem(product, 1);
  };

  if (loading) {
    return (
      <div className="py-8">
        <div className="flex justify-center">
          <h2 className="text-2xl font-bold mb-6">Recently Viewed</h2>
        </div>
        <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex-shrink-0 w-[250px] sm:w-[280px] md:w-[300px] bg-white rounded-lg overflow-hidden p-2 flex flex-col h-full">
            <Skeleton variant="rectangular" className="w-full aspect-[5/5.5] rounded-lg" />
            <div className="text-center mt-2 flex flex-col flex-grow">
              <Skeleton variant="text" className="h-4 w-3/4 mx-auto mb-2" />
              <Skeleton variant="text" className="h-3 w-full mx-auto mb-3" />
            </div>
            <Skeleton variant="rectangular" className="w-full h-10 rounded-md mt-auto" />
          </div>
          ))}
        </div>
      </div>
    );
  }

  if (recentlyViewedProducts.length === 0) {
    // Don't render the section if there are no recently viewed products
    return null;
  }

  return (
    <div className="py-8">
      <div className="flex justify-center">
        <h2 className="text-2xl font-bold mb-6">Recently Viewed</h2>
      </div>
      <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {recentlyViewedProducts.map((product) => (
          <div 
            key={product.id} 
            className="flex-shrink-0 w-[250px] sm:w-[280px] md:w-[300px] bg-white rounded-lg overflow-hidden p-2"
          >
            <Link to={`/products/${product.slug}`} className="block">
              <div
                className="bg-white rounded-lg overflow-hidden p-2 flex flex-col h-full"
              >
                <div className="w-full aspect-[5/5.5]">
                  <img 
                    src={product.images[0]?.src || '/placeholder.webp'} 
                    alt={product.name} 
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <div className="text-center mt-2 flex flex-col flex-grow">
                  <h3 className="text-[15px]">{product.name}</h3>
                  <p
                    className="text-[10px] text-black truncate"
                    dangerouslySetInnerHTML={{ __html: product.short_description }}
                  />
                  <div className="flex items-center justify-center gap-2 py-2">
                    {product.sale_price && product.sale_price !== '' && product.sale_price !== product.regular_price ? (
                      <>
                        <p className="text-gray-500 text-[13px] leading-[20px] line-through mb-1">৳{product.regular_price}</p>
                        <p className="text-gray-800 text-lg mb-2 mt-1">৳{product.sale_price}</p>
                      </>
                    ) : (
                      <p className="text-black mb-2 mt-2">৳{product.price}</p>
                    )}
                  </div>
                </div>
                <button 
                  className={`w-full py-2 bg-[#D4F871] uppercase rounded-md border-1 text-sm border-black flex justify-center items-center gap-2 mt-auto ${
                    isAddingItem(product.id) ? 'bg-gray-300' : ''
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleAddToCart(product);
                  }}
                  disabled={isAddingItem(product.id)}
                >
                  {isAddingItem(product.id) ? 'Adding...' : 'Add to cart'}
                  {!isAddingItem(product.id) && (
                    <span className="mb-[3px]">
                      <svg aria-hidden="true" fill="none" focusable="false" width="15" viewBox="0 0 24 24">
                        <path d="M4.75 8.25A.75.75 0 0 0 4 9L3 19.125c0 1.418 1.207 2.625 2.625 2.625h12.75c1.418 0 2.625-1.149 2.625-2.566L20 9a.75.75 0 0 0-.75-.75H4.75Zm2.75 0v-1.5a4.5 4.5 0 0 1 4.5-4.5v0a4.5 4.5 0 0 1 4.5 4.5v1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                      </svg>
                    </span>
                  )}
                </button>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentlyViewedProducts;
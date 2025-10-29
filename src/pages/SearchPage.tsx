import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import type { Product } from '../types/product';
import { woocommerceService } from '../services/woocommerceService';
import UniversalProductCard from '../components/UniversalProductCard';
import AllProductsCardSkeleton from '../components/AllProductsCardSkeleton';
import NoProductsFound from '../components/NoProductsFound';

const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (query) {
      setLoading(true);
      setError(null);
      
      woocommerceService.searchProducts(query)
        .then((results) => {
          setProducts(results);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message || 'An error occurred while searching');
          setLoading(false);
        });
    } else {
      setProducts([]);
      setLoading(false);
    }
  }, [query]);

  return (
    <div className="px-10 py-6">

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error}
        </div>
      )}

      {loading || (query && loading) ? (
        <AllProductsCardSkeleton count={10} />
      ) : products.length === 0 ? (
        <div className="py-16">
          <NoProductsFound message={`No products found for "${query}"`} />
          <div className="text-center mt-8">
            <Link 
              to="/" 
              className="inline-block bg-[#D4F871] px-6 py-3 rounded-md font-medium hover:bg-green-300 transition-colors"
            >
              Browse All Products
            </Link>
          </div>
        </div>
      ) : (
        <UniversalProductCard products={products} />
      )}
    </div>
  );
};

export default SearchPage;
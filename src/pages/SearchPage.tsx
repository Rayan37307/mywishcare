import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import type { Product } from '../types/product';
import { woocommerceService } from '../services/woocommerceService';

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
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Search Results</h1>
        <p className="text-gray-600">
          {loading ? 'Searching...' : `Found ${products.length} products for "${query}"`}
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-lg">Loading search results...</p>
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold mb-4">No products found</h2>
          <p className="text-gray-600 mb-6">We couldn't find any products matching your search.</p>
          <Link 
            to="/" 
            className="inline-block bg-[#D4F871] px-6 py-3 rounded-md font-medium hover:bg-green-300 transition-colors"
          >
            Browse All Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products.map((product) => (
            <div 
              key={product.id} 
              className="bg-white rounded-lg overflow-hidden p-2 flex flex-col transition-all h-full"
            >
              <Link to={`/products/${product.id}`}>
                <div className="w-full aspect-[5/6]">
                  <img 
                    src={product.images[0]?.src || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPgogIDxwYXRoIGQ9Ik0yMiAydi0yYTIgMiAwIDAgMC0yLTJIMTRhMiAyIDAgMCAwLTIgMnYySDRhMiAyIDAgMCAwLTIgMnYxNGEyIDIgMCAwIDAgMiAyaDE2YTIgMiAwIDAgMCAyLTJWMnptLTQgMTZINnYtMmgxMnYyem0wLTRINnYtMmgxMnYyem0wLTRINnYtMmgxMnYyem0wLTRINnYtMmgxMnYyem0wLTRINnYtMmgxMnYyeiIgLz4KPC9zdmc+'} 
                    alt={product.name} 
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <div className="text-center flex-grow mt-2">
                  <h3 className="text-[15px]">{product.name}</h3>
                  <p
                    className="text-[10px] text-black"
                    dangerouslySetInnerHTML={{ __html: product.short_description }}
                  />
                  <p className="text-black mb-2 mt-2">₹{product.price}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import type { Product } from '../types/product';
import { woocommerceService } from '../services/woocommerceService';
import { useCartStore } from '../store/cartStore';

const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const {addItem} = useCartStore();
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
    const handleAddToCart = (product: Product) => {
      addItem(product, 1);
    };

  return (
    <div className="px-10 py-6">

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
           <div key={product.id} className="bg-white rounded-lg overflow-hidden p-2 flex flex-col transition-all h-full">
                       <Link to={`/products/${product.id}`}>
                         <div className="w-full aspect-[5/6]">
                           <img
                             src={product.images[0]?.src || '/placeholder.webp'}
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
                       <button 
                         className="w-full py-2 bg-[#D4F871] uppercase rounded-md border-1 text-sm border-black flex justify-center items-center gap-2"
                         onClick={(e) => {
                           e.preventDefault();
                           handleAddToCart(product);
                         }}
                       >
                         Add to cart
                         <svg
                           aria-hidden="true"
                           fill="none"
                           focusable="false"
                           width="15"
                           viewBox="0 0 24 24"
                         >
                           <path
                             d="M4.75 8.25A.75.75 0 0 0 4 9L3 19.125c0 1.418 1.207 2.625 2.625 2.625h12.75c1.418 0 2.625-1.149 2.625-2.566L20 9a.75.75 0 0 0-.75-.75H4.75Zm2.75 0v-1.5a4.5 4.5 0 0 1 4.5-4.5v0a4.5 4.5 0 0 1 4.5 4.5v1.5"
                             stroke="currentColor"
                             strokeWidth="2"
                             strokeLinecap="round"
                             strokeLinejoin="round"
                           ></path>
                         </svg>
                       </button>
                     </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
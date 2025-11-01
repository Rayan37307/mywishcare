import React, { useState, useEffect, useCallback } from 'react';
import type { Product } from '../types/product';
import { woocommerceService } from '../services/woocommerceService';
import { Link } from 'react-router-dom';
import NoProductsFound from './NoProductsFound';

interface SearchBarProps {
  onSubmit: (searchTerm: string) => void;
  autoFocus?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSubmit, autoFocus = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Debounced search function
  const debouncedSearch = useCallback(
    (value: string) => {
      const delayDebounce = setTimeout(() => {
        if (value.trim().length > 0) {
          setLoading(true);
          woocommerceService.searchProducts(value)
            .then((results) => {
              setSearchResults(results);
              setLoading(false);
              setShowResults(true);
            })
            .catch((error) => {
              console.error('Search error:', error);
              setLoading(false);
              setSearchResults([]);
              setShowResults(true);
            });
        } else {
          setSearchResults([]);
          setShowResults(false);
        }
      }, 500); // 500ms delay for debouncing

      return () => clearTimeout(delayDebounce);
    },
    []
  );

  useEffect(() => {
    if (searchTerm) {
      debouncedSearch(searchTerm);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [searchTerm, debouncedSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(searchTerm);
  };

  const handleResultClick = (productName: string) => {
    setSearchTerm(productName);
    onSubmit(productName);
  };

  return (
    <div className="w-full">
      <form onSubmit={handleFormSubmit} className="relative">
        <div className="flex items-center rounded-full overflow-hidden">
          <button
            type="button"
            onClick={() => onSubmit(searchTerm)}
            className="pl-4 pr-2 py-3 flex items-center justify-center"
            aria-label="Search"
          >
            <svg
              aria-hidden="true"
              fill="none"
              focusable="false"
              width="24"
              viewBox="0 0 24 24"
              className="text-gray-800"
            >
              <path
                d="M10.364 3a7.364 7.364 0 1 0 0 14.727 7.364 7.364 0 0 0 0-14.727Z"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-miterlimit="10"
              ></path>
              <path
                d="M15.857 15.858 21 21.001"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-miterlimit="10"
                stroke-linecap="round"
              ></path>
            </svg>
          </button>
          <input
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            placeholder="Search for products..."
            className="w-full py-3 px-2 focus:outline-none text-lg uppercase"
            autoFocus={autoFocus}
          />
        </div>
        
        {/* Search results dropdown - Full width but aligned properly */}
        {showResults && (
          <div className="absolute z-10 left-0 right-0 bg-white shadow-lg max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">Searching...</div>
            ) : searchResults.length > 0 ? (
              <div>
                {searchResults.map((product) => (
                  <div
                    key={product.id}
                    className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                    onClick={() => handleResultClick(product.name)}
                  >
                    <Link to={`/products/${product.id}`} className="flex items-center">
                      <img
                        src={product.images[0]?.src || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPgogIDxwYXRoIGQ9Ik0yMiAydi0yYTIgMiAwIDAgMC0yLTJIMTRhMiAyIDAgMCAwLTIgMnYySDRhMiAyIDAgMCAwLTIgMnYxNGEyIDIgMCAwIDAgMiAyaDE2YTIgMiAwIDAgMCAyLTJWMnptLTQgMTZINnYtMmgxMnYyem0wLTRINnYtMmgxMnYyem0wLTRINnYtMmgxMnYyem0wLTRINnYtMmgxMnYyem0wLTRINnYtMmgxMnYyeiIgLz4KPC9zdmc+'}
                        alt={product.name}
                        className="w-12 h-12 object-contain mr-3"
                      />
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-600">
                          {product.sale_price && product.sale_price !== '' && product.sale_price !== product.regular_price ? (
                            <div className="flex items-center">
                              <span className="text-red-500 line-through text-xs mr-2">৳{product.regular_price}</span>
                              <span>৳{product.sale_price}</span>
                            </div>
                          ) : (
                            <span>৳{product.price}</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4">
                <NoProductsFound message={`No products found for "${searchTerm}"`} showImage={false} />
              </div>
            )}
            
            {/* View all results button */}
            {searchResults.length > 0 && (
              <div className="p-3 my-5 flex justify-center items-center">
                <button
                  type="button"
                  onClick={() => onSubmit(searchTerm)}
                  className=" py-3 text-center text-sm text-white px-4 uppercase bg-black font-medium"
                >
                  View all results 
                </button>
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
};

export default SearchBar;
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProductStore } from '../store/productStore';
import { useCartStore } from '../store/cartStore';
import ActiveOffersSection from '../components/wishcare/ActiveOffersSection';
import BenefitsSection from '../components/wishcare/BenefitsSection';
import WhatMakesItGreatSection from '../components/wishcare/WhatMakesItGreatSection';
import HowToUseSection from '../components/wishcare/HowToUseSection';
import IngredientsSection from '../components/wishcare/IngredientsSection';
import ResultsSection from '../components/wishcare/ResultsSection';
import PairsWithSection from '../components/wishcare/PairsWithSection';
import FAQSection from '../components/wishcare/FAQSection';
import { getImageUrlFromId } from '../utils/imageUtils';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { fetchProductById, setLoading, setError } = useProductStore();
  const { addItem } = useCartStore();
  const [product, setProduct] = React.useState<any>(null);
  const [loading, setLoadingState] = React.useState(true);
  const [quantity, setQuantity] = React.useState(1);
  const addToCartRef = useRef<HTMLDivElement>(null);
  
  const [showFloatingHeader, setShowFloatingHeader] = React.useState(false);

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
    }
  };

  useEffect(() => {
    // Add scroll event listener
    const handleScroll = () => {
      if (addToCartRef.current) {
        const rect = addToCartRef.current.getBoundingClientRect();
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        // Show floating header when scrolled past the add to cart section (considering navbar height)
        if (scrollTop > 300) { // Show after scrolling down 300px, which should be past the product details
          setShowFloatingHeader(true);
        } else {
          setShowFloatingHeader(false);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const getProduct = async () => {
      if (id) {
        setLoading(true);
        try {
          // Fetch product with WishCare data
          const fetchedProduct = await fetchProductById(Number(id));
          setProduct(fetchedProduct);
        } catch (err) {
          setError('Failed to fetch product');
        } finally {
          setLoading(false);
          setLoadingState(false);
        }
      }
    };

    getProduct();
  }, [id, fetchProductById, setLoading, setError]);

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (!product) {
    return <div className="text-center">Product not found.</div>;
  }

  return (
    <div className='bg-white py-10'>
      {/* Floating header that appears when scrolling past the add to cart section */}
      {showFloatingHeader && (
        <div className="fixed top-[72px] left-0 right-0 bg-white shadow-md z-50 py-3 px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-16 h-16 overflow-hidden rounded-lg mr-4">
              <img 
                src={product.images[0]?.src} 
                alt={product.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="font-bold truncate max-w-[50vw]">{product.name}</h2>
              <div className="text-sm text-gray-600">
                {product.sale_price && product.sale_price !== '' && product.sale_price !== product.regular_price ? (
                  <div className="flex items-center">
                    <span className="text-red-500 line-through text-xs mr-2">₹{product.regular_price}</span>
                    <span>₹{product.sale_price}</span>
                  </div>
                ) : (
                  <span>₹{product.price}</span>
                )}
              </div>
            </div>
          </div>
          <button 
            className="bg-black text-white px-4 py-3 uppercase text-sm font-semibold flex items-center justify-center gap-1"
            onClick={handleAddToCart}
          >
            Add to cart<svg style={{marginLeft: '6px', width: '16px', marginTop: '-3px'}} aria-hidden="true" fill="none" focusable="false" width="15" viewBox="0 0 24 24"><path d="M4.75 8.25A.75.75 0 0 0 4 9L3 19.125c0 1.418 1.207 2.625 2.625 2.625h12.75c1.418 0 2.625-1.149 2.625-2.566L20 9a.75.75 0 0 0-.75-.75H4.75Zm2.75 0v-1.5a4.5 4.5 0 0 1 4.5-4.5v0a4.5 4.5 0 0 1 4.5 4.5v1.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>

          </button>
        </div>
      )}
      
      {/* Main content */}
      <div className={`container mx-auto max-w-7xl p-4 ${showFloatingHeader ? 'pt-20' : ''}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <img 
              src={product.images[0]?.src} 
              alt={product.name} 
              className={`w-[80%] rounded-lg mx-auto sticky ${showFloatingHeader ? 'top-44' : 'top-4'}`}
            />
          </div>
          
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p
              className="text-[12px] my-3 text-black"
              dangerouslySetInnerHTML={{ __html: product.short_description }}
            />
            <div className="text-2xl text-gray-800 mb-4">
              {product.sale_price && product.sale_price !== '' && product.sale_price !== product.regular_price ? (
                <div className="flex items-center">
                  <span className="text-red-500 line-through text-sm mr-2">₹{product.regular_price}</span>
                  <span>₹{product.sale_price}</span>
                </div>
              ) : (
                <span>₹{product.price}</span>
              )}
            </div>
            
            {/* Add to cart section */}
            <div 
              ref={addToCartRef}
              className="flex items-center gap-4 mt-4"
            >
              <div className="flex items-center border border-gray-300 rounded">
                <button 
                  className="px-3 py-2 text-lg font-bold"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </button>
                <span className="px-4 py-2 text-center">{quantity}</span>
                <button 
                  className="px-3 py-2 text-lg font-bold"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </button>
              </div>
              <button 
                className="w-full py-3 bg-transparent uppercase flex items-center justify-center gap-2 border-1 text-[13px] border-gray-600 font-semibold"
                onClick={handleAddToCart}
              >
                Add to Cart 
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
            <button className="mt-4 w-full py-3 bg-black text-white uppercase flex items-center justify-center gap-2 border-1  text-[13px] border-black font-semibold">buy it now</button>
            <div
              className="prose pt-10"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
            {product.wishCare && (
              <div className="mt-4">
                {/* <h2 className="text-2xl font-bold mb-6 text-gray-800">Product Details</h2>
                 */}
                <div className='w-full mb-4'>
                  <img src="/multi.webp" alt="w-full" />
                </div>
                <ActiveOffersSection wishCare={product.wishCare} />
                <BenefitsSection wishCare={product.wishCare} />
                <WhatMakesItGreatSection 
                  wishCare={product.wishCare} 
                  getImageUrlFromId={getImageUrlFromId} 
                />
                <HowToUseSection 
                  wishCare={product.wishCare} 
                  getImageUrlFromId={getImageUrlFromId} 
                />
                <IngredientsSection 
                  wishCare={product.wishCare} 
                  getImageUrlFromId={getImageUrlFromId} 
                />
                <ResultsSection 
                  wishCare={product.wishCare} 
                  getImageUrlFromId={getImageUrlFromId} 
                />
                <PairsWithSection wishCare={product.wishCare} />
                {/* <FAQSection wishCare={product.wishCare} /> */}
              </div>
            )}
            
          </div>

        </div>
                  {product.wishCare && (
              <div className="mt-4">
                <FAQSection wishCare={product.wishCare} />
              </div>
            )}
      </div>
    </div>
  );
};

export default ProductDetail;
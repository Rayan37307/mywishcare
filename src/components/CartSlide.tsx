import { useEffect, useRef, useCallback, useState } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Mousewheel, FreeMode } from 'swiper/modules';
import { gsap } from 'gsap';

import { useCartStore } from "../store/cartStore";
import { useProductStore } from "../store/productStore";
import { Link } from 'react-router-dom';
import { useSidebar } from '../contexts/SidebarContext';
import NoProductsFound from './NoProductsFound';
import CartItem from './CartItem';

interface CartSlideProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartSlide: React.FC<CartSlideProps> = ({ isOpen, onClose }) => {
  const { items, totalItems, totalPrice, updateQuantity, removeItem, addItem } =
    useCartStore();
  const { bestSellingProducts, fetchBestSellingProducts } = useProductStore();
  const { closeAllSidebars } = useSidebar();
  
  const slideRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Animation function using GSAP
  const animateSlide = useCallback(() => {
    if (!slideRef.current || !backdropRef.current) return;

    if (isOpen) {
      setIsVisible(true);
      // Animate in
      gsap.set(slideRef.current, { 
        x: '100%', // Start from the right side
        scaleX: 0.95,
        scaleY: 1
      });
      gsap.set(backdropRef.current, { opacity: 0 });
      
      gsap.to(backdropRef.current, {
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out'
      });
      
      gsap.to(slideRef.current, {
        x: 0, // Move to final position
        scaleX: 1,
        duration: 0.4,
        ease: 'power2.out'
      });
    } else {
      // Animate out
      gsap.to(backdropRef.current, {
        opacity: 0,
        duration: 0.25,
        ease: 'power2.in'
      });
      
      gsap.to(slideRef.current, {
        x: '100%', // Move back to the right side
        scaleX: 0.95,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          setIsVisible(false); // Hide after animation completes
        }
      });
    }
  }, [isOpen]);
  
  useEffect(() => {
    if (bestSellingProducts.length === 0) {
      fetchBestSellingProducts();
    }
  }, [bestSellingProducts.length]); // Removed fetchBestSellingProducts from dependency to prevent infinite loop
  
  // Trigger GSAP animation when isOpen changes
  useEffect(() => {
    animateSlide();
  }, [animateSlide]);
  
  const messages = [
    "Free Delivery on ₹299+",
    "5% extra off on Prepaid Orders",
  ];

  // Memoize the messages array to prevent recreation on every render
  const memoizedMessages = useCallback(() => {
    const spacedDot = "|"; //\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0
    const repeatedMessages = [...messages, ...messages]; // duplicate for seamless loop
    return repeatedMessages.map((msg, i) => (
      <span
        key={i}
        className="flex items-center text-sm tracking-wide"
      >
        {msg}
        {i !== repeatedMessages.length - 1 && <span>{spacedDot}</span>}
      </span>
    ));
  }, [messages]);

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden ${isVisible ? "block" : "hidden"}`}
    >
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-black/25"
        onClick={onClose}
      ></div>

      {/* Slide panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="relative w-screen max-w-md">
          <div
            ref={slideRef}
            className="h-full flex flex-col bg-white shadow-xl ml-16 w-[calc(100%-4rem)]" // Reduced width with left margin
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 sm:py-6 border-b border-gray-200">
              <h2 className="text-lg sm:text-xl font-medium text-black font-semibold">
                Cart
              </h2>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-500"
                onClick={onClose}
              >
                <svg
                  className="h-5 w-5 sm:h-6 sm:w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Cart items */}
            <div className="w-full px-4 flex-shrink-0">
              <img src="/cartdiwali.jpg" alt="" className="w-full h-auto object-cover max-h-32" />
            </div>
            <div className="w-full bg-[#EAE1EF] py-3 overflow-hidden flex-shrink-0">
              <div className="flex whitespace-nowrap animate-marquee px-4 text-xs">
                {memoizedMessages()}
              </div>

              <style>{`
                .animate-marquee {
                  display: inline-flex;
                  animation: marquee 7s linear infinite;
                }

                @keyframes marquee {
                  0% {
                    transform: translateX(0);
                  }
                  100% {
                    transform: translateX(-50%);
                  }
                }
              `}</style>
            </div>
            
            {/* Main content with scrollable cart items */}
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto p-4">
                {items.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-gray-500">Your cart is empty</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map((item) => (
                      <CartItem 
                        key={item.product.id}
                        item={item}
                        updateQuantity={updateQuantity}
                        removeItem={removeItem}
                      />
                    ))}
                  </div>
                )}
              </div>
              
              {/* Trending products section - now properly constrained */}
              <div className="pb-4 bg-[#e9e7fd] px-3 flex-shrink-0">
                <h1 className="text-center text-lg sm:text-xl mb-4">Trending Products</h1>
                <div className="max-h-80 overflow-y-auto">
                  {bestSellingProducts.length === 0 ? (
                    <div className="flex items-center justify-center h-40">
                      <NoProductsFound message="No trending products" className="py-4" showImage={false} />
                    </div>
                  ) : (
                    <Swiper
                      modules={[Mousewheel, FreeMode]}
                      spaceBetween={10}               // gap between cards
                      slidesPerView={'auto'}          // allows natural horizontal scroll
                      freeMode={{ enabled: true, momentum: false }} // smooth scrolling
                      mousewheel={true}
                      className="mySwiper px-2"
                    >
                      {bestSellingProducts.map((product) => (
                        <SwiperSlide
                          key={product.id}
                          className="!w-[140px] sm:!w-[160px]"
                        >
                          <div className="bg-white rounded-lg overflow-hidden p-2 flex flex-col h-full">
                            <Link 
                              to={`/products/${product.id}`}
                              className="h-full block"
                              onClick={() => {
                                closeAllSidebars();
                                onClose();
                              }}
                            >
                              <div className="w-full aspect-[3/4]">
                                <img
                                  src={product.images[0]?.src || '/placeholder.webp'}
                                  alt={product.name}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              </div>
                              <div className="text-center flex-grow mt-2">
                                <h3 className="text-[11px] sm:text-[12px] font-medium line-clamp-2">{product.name}</h3>
                                <div className="text-[9px] sm:text-[10px] text-black mt-1">
                                  {product.sale_price && product.sale_price !== '' && product.sale_price !== product.regular_price ? (
                                    <div className="flex flex-col items-center">
                                      <span className="text-red-500 text-[8px] sm:text-[9px] line-through">₹{product.regular_price}</span>
                                      <span>₹{product.sale_price}</span>
                                    </div>
                                  ) : (
                                    <span>₹{product.price}</span>
                                  )}
                                </div>
                              </div>
                            </Link>
                            <button 
                              className="w-full py-1.5 bg-[#D4F871] uppercase rounded-md border-1 text-[10px] sm:text-[11px] border-black flex justify-center items-center gap-1 mt-2"
                              onClick={(e) => {
                                e.preventDefault();
                                addItem(product, 1);
                              }}
                            >
                              Add to cart 
                              <svg aria-hidden="true" fill="none" focusable="false" width="8" viewBox="0 0 24 24">
                                <path d="M4.75 8.25A.75.75 0 0 0 4 9L3 19.125c0 1.418 1.207 2.625 2.625 2.625h12.75c1.418 0 2.625-1.149 2.625-2.566L20 9a.75.75 0 0 0-.75-.75H4.75Zm2.75 0v-1.5a4.5 4.5 0 0 1 4.5-4.5v0a4.5 4.5 0 0 1 4.5 4.5v1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                              </svg>
                            </button>
                          </div>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-4 border-t border-gray-200 flex-shrink-0">
                <div className="space-y-4">
                  <Link to="/checkout" onClick={() => { closeAllSidebars(); onClose(); }} className="w-full block">
                    <button
                      className="w-full flex justify-center px-4 py-3 text-sm font-medium text-white bg-black hover:bg-black rounded-md"
                    >
                      Checkout ({totalItems} items) . ₹{totalPrice.toFixed(0)}
                    </button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartSlide;

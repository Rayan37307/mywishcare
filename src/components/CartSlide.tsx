import { useEffect } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Mousewheel, FreeMode } from 'swiper/modules';

import { useCartStore } from "../store/cartStore";
import { useProductStore } from "../store/productStore";
import { Link } from 'react-router-dom';

interface CartSlideProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartSlide: React.FC<CartSlideProps> = ({ isOpen, onClose }) => {
  const { items, totalPrice, updateQuantity, removeItem, addItem } =
    useCartStore();
  const { bestSellingProducts, fetchBestSellingProducts } = useProductStore();
  
  useEffect(() => {
    if (bestSellingProducts.length === 0) {
      fetchBestSellingProducts();
    }
  }, [bestSellingProducts.length, fetchBestSellingProducts]);
  
  const messages = [
    "Free Delivery on ₹299+",
    "5% extra off on Prepaid Orders",
 ];

  // Function to insert dot dividers between every message (including end-to-start)
  const renderMessages = () => {
    const spacedDot = "|";//\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0
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
  };

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden ${
        isOpen ? "block" : "hidden"
      }`}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ease-out ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      ></div>

      {/* Slide panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="relative w-screen max-w-md">
          <div
            className={`h-full flex flex-col bg-white shadow-xl transform transition-all duration-500 ease-out ${
              isOpen ? "translate-x-0 translate-y-0 scale-100" : "translate-x-full translate-y-0 scale-95"
            }`}
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
                {renderMessages()}
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
                      <div
                        key={item.product.id}
                        className="flex items-center pb-4"
                      >
                        <img
                          src={item.product.images[0]?.src || "/placeholder.webp"}
                          alt={item.product.name}
                          className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0 ml-3">
                          <h3 className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                            {item.product.name}
                          </h3>
                          <div className="text-[9px] max-md:text-[8px] mt-1">
                            {item.product.sale_price && item.product.sale_price !== '' && item.product.sale_price !== item.product.regular_price ? (
                              <div className="flex items-center gap-0.5">
                                <span className="text-red-500">₹{item.product.sale_price}</span>
                                <span className="line-through text-gray-600 text-[8px] max-md:text-[7px]">₹{item.product.regular_price}</span>
                              </div>
                            ) : (
                              <span>₹{item.product.price}</span>
                            )}
                          </div>
                          <div className="flex items-center mt-2 space-x-2">
                            <button
                              className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center border border-gray-300 text-sm"
                              onClick={() =>
                                updateQuantity(item.product.id, item.quantity - 1)
                              }
                            >
                              -
                            </button>
                            <span className="text-sm min-w-[20px] text-center">{item.quantity}</span>
                            <button
                              className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center border border-gray-300 text-sm"
                              onClick={() =>
                                updateQuantity(item.product.id, item.quantity + 1)
                              }
                            >
                              +
                            </button>
                            <button
                              className="text-gray-600 underline text-xs sm:text-sm ml-2"
                              onClick={() => removeItem(item.product.id)}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Trending products section - now properly constrained */}
              <div className="pb-4 bg-[#e9e7fd] px-3 flex-shrink-0">
                <h1 className="text-center text-lg sm:text-xl mb-4">Trending Products</h1>
                <div className="max-h-64 overflow-y-auto">
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
                        className="!w-[110px] max-md:!w-[90px]"
                      >
                        <div className="bg-white rounded-lg overflow-hidden p-1.5 flex flex-col h-full">
                          <Link to={`/products/${product.id}`} className="h-full block">
                            <div className="w-full aspect-[3/4]">
                              <img
                                src={product.images[0]?.src || '/placeholder.webp'}
                                alt={product.name}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            </div>
                            <div className="text-center flex-grow mt-1">
                              <h3 className="text-[9px] max-md:text-[8px] font-medium truncate">{product.name}</h3>
                              <div className="text-[6px] max-md:text-[5px] text-black mt-1">
                                {product.sale_price && product.sale_price !== '' && product.sale_price !== product.regular_price ? (
                                  <div className="flex flex-col items-center">
                                    <span className="text-red-500 text-[4px] max-md:text-[3px] line-through">₹{product.regular_price}</span>
                                    <span>₹{product.sale_price}</span>
                                  </div>
                                ) : (
                                  <span>₹{product.price}</span>
                                )}
                              </div>
                            </div>
                          </Link>
                          <button 
                            className="w-full py-0.5 bg-[#D4F871] uppercase rounded-md border-1 text-[8px] max-md:text-[7px] border-black flex justify-center items-center gap-0.5 mt-1"
                            onClick={(e) => {
                              e.preventDefault();
                              addItem(product, 1);
                            }}
                          >
                            Add to cart 
                            <svg aria-hidden="true" fill="none" focusable="false" width="5" max-md:width="4" viewBox="0 0 24 24">
                              <path d="M4.75 8.25A.75.75 0 0 0 4 9L3 19.125c0 1.418 1.207 2.625 2.625 2.625h12.75c1.418 0 2.625-1.149 2.625-2.566L20 9a.75.75 0 0 0-.75-.75H4.75Zm2.75 0v-1.5a4.5 4.5 0 0 1 4.5-4.5v0a4.5 4.5 0 0 1 4.5 4.5v1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                            </svg>
                          </button>
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              </div>
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-4 border-t border-gray-200 flex-shrink-0">
                <div className="space-y-4">
                  <Link to="/checkout" onClick={onClose} className="w-full block">
                    <button
                      className="w-full flex justify-center px-4 py-3 text-sm font-medium text-white bg-black hover:bg-black rounded-md"
                    >
                      Checkout . ₹{totalPrice.toFixed(0)}
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

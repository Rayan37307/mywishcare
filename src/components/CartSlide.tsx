import { useEffect, useRef, useCallback, useState } from "react";
import { gsap } from "gsap";
import { useCartStore } from "../store/cartStore";
import { useProductStore } from "../store/productStore";
import { Link } from "react-router-dom";
import { useSidebar } from "../contexts/SidebarContext";
import NoProductsFound from "./NoProductsFound";

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

  const animateSlide = useCallback(() => {
    if (!slideRef.current || !backdropRef.current) return;

    if (isOpen) {
      setIsVisible(true);
      gsap.set(slideRef.current, { x: "100%", scaleX: 0.95 });
      gsap.set(backdropRef.current, { opacity: 0 });
      gsap.to(backdropRef.current, {
        opacity: 1,
        duration: 0.3,
        ease: "power2.out",
      });
      gsap.to(slideRef.current, {
        x: 0,
        scaleX: 1,
        duration: 0.4,
        ease: "power2.out",
      });
    } else {
      gsap.to(backdropRef.current, {
        opacity: 0,
        duration: 0.25,
        ease: "power2.in",
      });
      gsap.to(slideRef.current, {
        x: "100%",
        scaleX: 0.95,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => setIsVisible(false),
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!bestSellingProducts.length) fetchBestSellingProducts();
  }, [bestSellingProducts.length]);

  useEffect(() => {
    animateSlide();
  }, [animateSlide]);

  const messages = ["Get extra 5% off use code wcbd5 on BDT ৳2,999 shopping"];
  const memoizedMessages = useCallback(() => {
    const spacedDot = "|";
    const repeated = [...messages, ...messages];
    return repeated.map((msg, i) => (
      <span key={i} className="flex items-center text-sm tracking-wide">
        {msg}
        {i !== repeated.length - 1 && <span>{spacedDot}</span>}
      </span>
    ));
  }, [messages]);

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden ${
        isVisible ? "block" : "hidden"
      }`}
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
            className="h-full flex flex-col bg-white shadow-xl ml-16 w-[calc(100%-4rem)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 sm:py-6 border-b border-gray-200">
              <h2 className="text-lg sm:text-xl font-semibold text-black">
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

            {/* Banner */}
            <div className="w-full px-4 flex-shrink-0">
              <img
                src="/cartbanner.png"
                alt=""
                className="w-full h-auto object-cover max-h-32 rounded-md"
              />
            </div>

            {/* Marquee */}
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
                  0% { transform: translateX(0); }
                  100% { transform: translateX(-50%); }
                }
              `}</style>
            </div>

            {/* Scrollable Content (Cart Items + Trending Section) */}
            <div className="flex-1 flex flex-col min-h-0 p-4 gap-6 overflow-y-auto scrollbar-hidden">
              {/* Cart items */}
              {items.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-500">Your cart is empty</p>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.product.id}
                    className="bg-white rounded-lg p-4 flex gap-4 items-center border border-gray-100"
                  >
                    <div className="w-24 h-24 flex-shrink-0">
                      <img
                        src={
                          item.product.images[0]?.src || "/placeholder.webp"
                        }
                        alt={item.product.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <h3 className="text-sm sm:text-base font-medium line-clamp-2">
                        {item.product.name}
                      </h3>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-black font-semibold text-base sm:text-lg">
                          ৳
                          {item.product.sale_price &&
                          item.product.sale_price !==
                            item.product.regular_price
                            ? item.product.sale_price
                            : item.product.price}
                        </span>
                        {item.product.sale_price &&
                          item.product.sale_price !==
                            item.product.regular_price && (
                            <span className="text-gray-500 line-through text-sm sm:text-base">
                              ৳{item.product.regular_price}
                            </span>
                          )}
                      </div>
                      <div className="mt-2 flex gap-2 items-center">
                        <button
                          className="px-2 py-1 border border-gray-300 rounded-md"
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.quantity - 1
                            )
                          }
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          className={`px-2 py-1 border border-gray-300 rounded-md ${
                            item.product.manage_stock && 
                            item.product.stock_quantity !== null && 
                            item.quantity >= item.product.stock_quantity
                              ? 'opacity-50 cursor-not-allowed'
                              : ''
                          }`}
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.quantity + 1
                            )
                          }
                          disabled={
                            item.product.manage_stock && 
                            item.product.stock_quantity !== null && 
                            item.quantity >= item.product.stock_quantity
                          }
                        >
                          +
                        </button>
                        <button
                          className="ml-auto text-red-500 text-sm sm:text-base"
                          onClick={() => removeItem(item.product.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}

              {/* Trending Products Section */}
              <div className="pb-4 bg-[#e9e7fd] px-3 py-3 mt-6 rounded-lg">
                <h1 className="text-center text-lg sm:text-xl mb-4 font-semibold">
                  Trending Products
                </h1>
                <div className="flex gap-3 overflow-x-auto scrollbar-hidden py-2">
                  {bestSellingProducts.length === 0 ? (
                    <NoProductsFound
                      message="No trending products"
                      className="py-4"
                      showImage={false}
                    />
                  ) : (
                    bestSellingProducts.map((product) => (
                      <div
                        key={product.id}
                        className="flex-shrink-0 w-[140px] sm:w-[160px]"
                      >
                        <div className="bg-white rounded-lg overflow-hidden p-2 flex flex-col h-full shadow-md">
                          <Link
                            to={`/products/${product.id}`}
                            className="block"
                            onClick={() => {
                              closeAllSidebars();
                              onClose();
                            }}
                          >
                            <div className="w-full aspect-[3/4]">
                              <img
                                src={
                                  product.images[0]?.src || "/placeholder.webp"
                                }
                                alt={product.name}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            </div>
                            <div className="text-center mt-2 flex flex-col flex-grow">
                              <h3 className="text-[11px] sm:text-[12px] font-medium line-clamp-2">
                                {product.name}
                              </h3>
                              <div className="text-[9px] sm:text-[10px] text-black mt-1">
                                {product.sale_price &&
                                product.sale_price !== "" &&
                                product.sale_price !==
                                  product.regular_price ? (
                                  <div className="flex flex-col items-center">
                                    <span className="text-red-500 text-[8px] sm:text-[9px] line-through">
                                      ৳{product.regular_price}
                                    </span>
                                    <span>৳{product.sale_price}</span>
                                  </div>
                                ) : (
                                  <span>৳{product.price}</span>
                                )}
                              </div>
                            </div>
                          </Link>
                          <button
                            className="w-full py-1.5 bg-[#D4F871] uppercase rounded-md border border-black text-[10px] sm:text-[11px] flex justify-center items-center gap-1 mt-auto"
                            onClick={(e) => {
                              e.preventDefault();
                              addItem(product, 1);
                            }}
                          >
                            Add to cart
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-4 border-t border-gray-200 flex-shrink-0">
                <Link
                  to="/checkout"
                  onClick={() => {
                    closeAllSidebars();
                    onClose();
                  }}
                  className="w-full block"
                >
                  <button className="w-full flex justify-center px-4 py-3 text-sm font-medium text-white bg-black hover:bg-black rounded-md">
                    Checkout ({totalItems} items) · ৳{totalPrice.toFixed(0)}
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartSlide;

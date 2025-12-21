import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useCartStore } from "../store/cartStore";
import { useProductStore } from "../store/productStore";
import { useSidebar } from "../contexts/SidebarContext";
import NoProductsFound from "./NoProductsFound";
// import { pixelYourSiteService } from "../services/pixelYourSiteService";

interface CartSlideProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartSlide: React.FC<CartSlideProps> = ({ isOpen, onClose }) => {
  const { items, totalItems, totalPrice, updateQuantity, removeItem, addItem } =
    useCartStore();
  const { bestSellingProducts, fetchBestSellingProducts } =
    useProductStore();
  const { closeAllSidebars } = useSidebar();

  // lock body scroll when cart is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // fetch trending products
  useEffect(() => {
    if (!bestSellingProducts.length) fetchBestSellingProducts();
  }, [bestSellingProducts.length, fetchBestSellingProducts]);

  // marquee messages
  const messages = ["Get extra 5% off use code wcbd5 on BDT ৳2,999 shopping"];
  // const memoizedMessages = useCallback(() => {
  //   // repeated without extra spacing at the end
  //   const repeated = [...messages, ...messages];
  //   return repeated.map((msg, i) => (
  //     <span key={i} className="flex items-center text-sm tracking-wide">
  //       {msg}
  //     </span>
  //   ));
  // }, []);

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden ${
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      }`}
      style={{ touchAction: "none" }}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ease-out ${
          isOpen ? "opacity-50" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Slide panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="relative w-screen max-w-md">
          <div
            className={`h-full flex flex-col bg-white shadow-xl ml-16 w-[calc(100%-4rem)]
            transform transition-all duration-300 ease-out
            ${isOpen ? "translate-x-0" : "translate-x-full"}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 sm:py-6 border-b border-gray-200">
              <h2 className="text-lg sm:text-xl font-semibold">Cart</h2>
              <button
                className="text-gray-400 hover:text-gray-500 text-xl"
                onClick={onClose}
              >
                ✕
              </button>
            </div>

            {/* Banner */}
            <div className="px-4 flex-shrink-0">
              <img
                src="/cartbanner.png"
                alt=""
                className="w-full max-h-32 rounded-md object-cover"
              />
            </div>

            {/* Marquee */}
           {/* Marquee */}
<div className="w-full bg-[#EAE1EF] py-3 overflow-hidden flex-shrink-0">
  <div className="inline-flex animate-marquee text-xs">
    {/* Duplicate messages for seamless loop */}
    {messages.map((msg, i) => (
      <span key={i} className="flex items-center whitespace-nowrap">
        {msg}  |  </span>
    ))}
    {messages.map((msg, i) => (
      <span key={i + messages.length} className="flex items-center whitespace-nowrap">
          |  {msg}  |  
      </span>
    ))}
  </div>

  <style>{`
    .animate-marquee {
      display: inline-flex;
      animation: marquee 10s linear infinite;
    }
    @keyframes marquee {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
  `}</style>
</div>


            {/* Scrollable content */}
            <div className="flex-1 flex flex-col min-h-0 p-4 gap-6 overflow-y-auto scrollbar-hidden">
              {/* Cart Items */}
              {items.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  Your cart is empty
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.product.id}
                    className="bg-white border border-gray-100 rounded-lg p-4 flex gap-4"
                  >
                    <img
                      src={item.product.images[0]?.src || "/placeholder.webp"}
                      alt={item.product.name}
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                    <div className="flex-1 flex flex-col">
                      <h3 className="text-sm font-medium line-clamp-2">
                        {item.product.name}
                      </h3>

                      <div className="mt-2 flex gap-2 items-center">
                        <span className="font-semibold">
                          ৳
                          {item.product.sale_price &&
                          item.product.sale_price !== item.product.regular_price
                            ? item.product.sale_price
                            : item.product.price}
                        </span>
                        {item.product.sale_price &&
                          item.product.sale_price !== item.product.regular_price && (
                            <span className="text-gray-500 line-through text-sm">
                              ৳{item.product.regular_price}
                            </span>
                          )}
                      </div>

                      <div className="mt-3 flex items-center gap-2">
                        <button
                          className="px-2 py-1 border rounded"
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity - 1)
                          }
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          className="px-2 py-1 border rounded"
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity + 1)
                          }
                        >
                          +
                        </button>

                        <button
                          className="ml-auto text-red-500 text-sm"
                          onClick={() => removeItem(item.product.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}

              {/* Trending */}
              <div className="bg-[#e9e7fd] rounded-lg p-3">
                <h2 className="text-center font-semibold mb-3">
                  Trending Products
                </h2>

                <div className="flex gap-3 overflow-x-auto scrollbar-hidden py-2">
                  {bestSellingProducts.length === 0 ? (
                    <NoProductsFound
                      message="No trending products"
                      showImage={false}
                    />
                  ) : (
                    bestSellingProducts.map((product) => (
                      <div
                        key={product.id}
                        className="w-[150px] flex-shrink-0 bg-white rounded-lg p-2 shadow"
                      >
                        <Link
                          to={`/products/${product.id}`}
                          onClick={() => {
                            closeAllSidebars();
                            onClose();
                          }}
                        >
                          <img
                            src={
                              product.images[0]?.src || "/placeholder.webp"
                            }
                            alt={product.name}
                            className="rounded-lg object-cover aspect-[3/4]"
                          />
                          <p className="text-xs mt-2 line-clamp-2">
                            {product.name}
                          </p>
                        </Link>

                        <button
                          className="w-full mt-2 py-1.5 bg-[#D4F871] border border-black rounded text-[10px]"
                          onClick={() => addItem(product, 1)}
                        >
                          Add to cart
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="flex-shrink-0 border-t border-gray-200 p-4">
                <Link
                  to="/checkout"
                  onClick={() => {
                    closeAllSidebars();
                    onClose();
                  }}
                >
                  <button className="w-full bg-black text-white py-3 rounded-md">
                    Checkout ({totalItems}) · ৳{totalPrice.toFixed(0)}
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

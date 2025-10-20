import React from "react";
import { useCartStore } from "../store/cartStore";

interface CartSlideProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartSlide: React.FC<CartSlideProps> = ({ isOpen, onClose }) => {
  const { items, totalItems, totalPrice, updateQuantity, removeItem } =
    useCartStore();
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
        className={`absolute inset-0 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      ></div>

      {/* Slide panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="relative w-screen max-w-md">
          <div
            className={`h-full flex flex-col bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
              isOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-6 border-b border-gray-200">
              <h2 className="text-xl font-medium text-black font-semibold">
                Cart
              </h2>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-500"
                onClick={onClose}
              >
                <svg
                  className="h-6 w-6"
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
            <div className="w-full">
              <img src="/cartdiwali.jpg" alt="" className="w-full h-auto" />
            </div>
            <div className="w-full bg-[#EAE1EF] py-3 overflow-hidden">
              <div className="flex whitespace-nowrap animate-marquee">
                {renderMessages()}
              </div>

              <style jsx>{`
                .animate-marquee {
                  display: inline-flex;
                  animation: marquee 15s linear infinite;
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
                      className="flex items-center space-x-4 pb-4"
                    >
                      <img
                        src={item.product.images[0]?.src || "/placeholder.webp"}
                        alt={item.product.name}
                        className="w-24 h-24 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {item.product.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          ₹{item.product.price}
                        </p>
                        <div className="flex items-center mt-1">
                          <button
                            className="px-2 py-1 border border-gray-300 text-sm"
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity - 1)
                            }
                          >
                            -
                          </button>
                          <span className="mx-2">{item.quantity}</span>
                          <button
                            className="px-2 py-1 border border-gray-300 text-sm"
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity + 1)
                            }
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          ₹
                          {(
                            parseFloat(
                              item.product.price.replace(/[^\d.-]/g, "")
                            ) * item.quantity
                          ).toFixed(2)}
                        </p>
                        <button
                          className="mt-1 text-red-600 hover:text-red-800 text-sm"
                          onClick={() => removeItem(item.product.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className=" p-4">
                <div className="space-y-4">
                  <button
                    onClick={onClose}
                    className="w-full flex justify-center px-4 py-3 text-sm font-medium text-white bg-black hover:bg-black"
                  >
                    Checkout . ₹{totalPrice.toFixed(2)}
                  </button>
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

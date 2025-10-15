import React from 'react';

const BannerSlider = () => {
  const messages = [
    "WELCOME TO MY WISH CARE",
    "FREE SHIPPING ON ORDERS OVER ₹500",
    "EXCLUSIVE DISCOUNTS FOR NEW CUSTOMERS",
    "PREMIUM QUALITY GUARANTEED",
    "24/7 CUSTOMER SUPPORT",
    "NATURAL INGREDIENTS"
  ];

  return (
    <div className="w-full bg-white py-3 overflow-hidden">
      <div className="flex whitespace-nowrap animate-marquee">
        {messages.map((message, index) => (
          <div key={index} className="text-black uppercase text-lg font-bold flex-shrink-0 mx-8">
            {message}
          </div>
        ))}
        {/* Duplicate the messages to create a seamless loop */}
        {messages.map((message, index) => (
          <div key={`dup-${index}`} className="text-black uppercase text-lg font-bold flex-shrink-0 mx-8">
            {message}
          </div>
        ))}
      </div>
      <style jsx>{`
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </div>
  );
};

export default BannerSlider;
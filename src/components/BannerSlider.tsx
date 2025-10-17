import React from 'react';

const BannerSlider = () => {
  const messages = [
    "Multifunctional Approach",
    "Effective SelfCare",
    "Biomimetic Ingredients",
  ];

  // Function to insert dot dividers between every message (including end-to-start)
  const renderMessages = () => {
    const spacedDot = "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0•\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0";
    const repeatedMessages = [...messages, ...messages]; // duplicate for seamless loop
    return repeatedMessages.map((msg, i) => (
      <span key={i} className="flex items-center text-2xl sm:text-3xl tracking-wide">
        {msg}
        {i !== repeatedMessages.length - 1 && <span>{spacedDot}</span>}
      </span>
    ));
  };

  return (
    <div className="w-full bg-white py-3 overflow-hidden">
      <div className="flex whitespace-nowrap animate-marquee">
        {renderMessages()}
      </div>

      <style jsx>{`
        .animate-marquee {
          display: inline-flex;
          animation: marquee 25s linear infinite;
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
  );
};

export default BannerSlider;

import React from 'react';

const DiscountSticker = () => {
  return (
    <div 
      className="fixed right-0 top-1/2 transform -translate-y-1/2 z-50"
      style={{ 
        writingMode: 'vertical-rl',
        textOrientation: 'mixed',
      }}
    >
      <div className="bg-white rounded-tr-[10px] rounded-br-[10px] text-lg font-bold py-4 px-6 rotate-180 text-center whitespace-nowrap">
        <div className="transform rotate-180">Extra 25% off*</div>
      </div>
    </div>
  );
};

export default DiscountSticker;

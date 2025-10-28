import React from 'react';

const SimpleLoader: React.FC = () => {
  return (
    <div 
      className="fixed inset-0 bg-[#D4F871] z-50 flex items-center justify-center"
      style={{ pointerEvents: 'none' }}
    >
      <div className="flex flex-col items-center space-y-2">
        {/* Black bars going from big to small with animated pulse effect */}
        <div 
          className="w-24 h-2 bg-black rounded-full pulse-bar-animation"
          style={{ 
            animationDelay: '0s'
          }}
        ></div>
        <div 
          className="w-20 h-2 bg-black rounded-full pulse-bar-animation"
          style={{ 
            animationDelay: '0.2s'
          }}
        ></div>
        <div 
          className="w-16 h-2 bg-black rounded-full pulse-bar-animation"
          style={{ 
            animationDelay: '0.4s'
          }}
        ></div>
        <div 
          className="w-12 h-2 bg-black rounded-full pulse-bar-animation"
          style={{ 
            animationDelay: '0.6s'
          }}
        ></div>
        <div 
          className="w-8 h-2 bg-black rounded-full pulse-bar-animation"
          style={{ 
            animationDelay: '0.8s'
          }}
        ></div>
      </div>
    </div>
  );
};

export default SimpleLoader;
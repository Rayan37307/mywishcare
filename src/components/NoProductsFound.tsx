import React from 'react';

interface NoProductsFoundProps {
  message?: string;
  className?: string;
  showImage?: boolean;
}

const NoProductsFound: React.FC<NoProductsFoundProps> = ({ 
  message = 'No products found', 
  className = '',
  showImage = true
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      {showImage && (
        <div className="mb-6">
          <svg 
            className="w-24 h-24 mx-auto text-gray-400"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      )}
      <h3 className="text-xl font-semibold text-gray-700 mb-2">{message}</h3>
      <p className="text-gray-500 max-w-md">
        We couldn't find any products matching your criteria. Please try a different search or check back later.
      </p>
    </div>
  );
};

export default NoProductsFound;
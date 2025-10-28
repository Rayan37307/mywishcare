import React from 'react';
import Skeleton from './Skeleton';

const AllProductsCardSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => {
  const skeletons = Array.from({ length: count }, (_, index) => (
    <div 
      key={`skeleton-${index}`} 
      className="bg-white rounded-lg overflow-hidden p-2 flex flex-col h-full"
    >
      {/* Image placeholder */}
      <div className="w-full aspect-[5/5.5]">
        <Skeleton 
          variant="rectangular" 
          className="w-full h-full rounded-lg" 
        />
      </div>
      
      <div className="text-center flex-grow mt-2">
        {/* Product title placeholder */}
        <Skeleton 
          variant="text" 
          className="h-4 w-3/4 mx-auto mb-2" 
        />
        
        {/* Short description placeholder */}
        <Skeleton 
          variant="text" 
          className="h-3 w-full mx-auto mb-4" 
        />
        
        {/* Price placeholder */}
        <div className="flex items-center justify-center gap-2 py-2">
          <Skeleton 
            variant="text" 
            className="h-4 w-1/3" 
          />
        </div>
      </div>
      
      {/* Add to cart button placeholder */}
      <Skeleton 
        variant="rectangular" 
        className="w-full h-10 rounded-md" 
      />
    </div>
  ));

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
      {skeletons}
    </div>
  );
};

export default AllProductsCardSkeleton;
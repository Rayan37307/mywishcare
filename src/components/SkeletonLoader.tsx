import React from 'react';

interface SkeletonLoaderProps {
  type?: 'card' | 'text' | 'image' | 'button' | 'list-item' | 'avatar' | 'paragraph';
  className?: string;
  count?: number;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  type = 'card', 
  className = '', 
  count = 1 
}) => {
  const baseClasses = "animate-pulse bg-gray-200 rounded-md";
  
  const renderSkeleton = (index: number) => {
    switch (type) {
      case 'card':
        return (
          <div 
            key={index}
            className={`${baseClasses} ${className || 'h-32 w-full'}`}
          />
        );
      case 'text':
        return (
          <div 
            key={index}
            className={`${baseClasses} ${className || 'h-4 w-3/4'}`}
          />
        );
      case 'image':
        return (
          <div 
            key={index}
            className={`${baseClasses} ${className || 'h-48 w-full'}`}
          />
        );
      case 'button':
        return (
          <div 
            key={index}
            className={`${baseClasses} ${className || 'h-10 w-24'}`}
          />
        );
      case 'list-item':
        return (
          <div 
            key={index}
            className={`${baseClasses} ${className || 'h-16 w-full'}`}
          />
        );
      case 'avatar':
        return (
          <div 
            key={index}
            className={`${baseClasses} rounded-full ${className || 'h-10 w-10'}`}
          />
        );
      case 'paragraph':
        return (
          <div key={index} className="space-y-2">
            <div className={`${baseClasses} ${className || 'h-4 w-full'}`} />
            <div className={`${baseClasses} ${className || 'h-4 w-5/6'}`} />
            <div className={`${baseClasses} ${className || 'h-4 w-4/6'}`} />
          </div>
        );
      default:
        return (
          <div 
            key={index}
            className={`${baseClasses} ${className || 'h-32 w-full'}`}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, index) => renderSkeleton(index))}
    </div>
  );
};

export default SkeletonLoader;
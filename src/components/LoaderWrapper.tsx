import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import SimpleLoader from './SimpleLoader';

interface LoaderWrapperProps {
  children: React.ReactNode;
}

const LoaderWrapper: React.FC<LoaderWrapperProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  
  // Show loading state when route changes, hide after a delay
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800); // Show loader for 800ms on route change
    
    return () => clearTimeout(timer);
  }, [location]);

  return (
    <>
      {isLoading && <SimpleLoader />}
      {children}
    </>
  );
};

export default LoaderWrapper;
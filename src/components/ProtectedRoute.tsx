// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallbackPath = '/login' 
}) => {
  const { isAuthenticated, loading, error } = useAuth();
  
  console.log('ProtectedRoute - loading:', loading, 'isAuthenticated:', isAuthenticated, 'error:', error); // Debug log

  if (loading) {
    console.log('ProtectedRoute - showing loading spinner'); // Debug log
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('ProtectedRoute - user not authenticated, redirecting to login'); // Debug log
    return <Navigate to={fallbackPath} replace />;
  }

  console.log('ProtectedRoute - user authenticated, rendering children'); // Debug log
  return <>{children}</>;
};

export default ProtectedRoute;
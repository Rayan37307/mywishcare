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
  fallbackPath = '/' 
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
    console.log('ProtectedRoute - user not authenticated, redirecting to home'); // Debug log
    // Instead of redirecting to /login which no longer exists, redirect to home
    // and the user can click the login button to open the auth modal
    return <Navigate to={fallbackPath} replace />;
  }

  console.log('ProtectedRoute - user authenticated, rendering children'); // Debug log
  return <>{children}</>;
};

export default ProtectedRoute;
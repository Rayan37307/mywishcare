// src/components/Navigation.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FaUser, FaSignOutAlt, FaSignInAlt, FaHome } from 'react-icons/fa';

const Navigation: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-8">
          <Link to="/" className="text-xl font-bold flex items-center">
            <FaHome className="mr-2" />
            MyWishCare
          </Link>
          
          <div className="flex space-x-4">
            <Link 
              to="/" 
              className="hover:text-blue-300 transition-colors"
            >
              Home
            </Link>
            
            {isAuthenticated && (
              <>
                <Link 
                  to="/profile" 
                  className="hover:text-blue-300 transition-colors flex items-center"
                >
                  <FaUser className="mr-1" /> Profile
                </Link>
              </>
            )}
          </div>
        </div>
        
        <div>
          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <span className="text-sm">Welcome, {user?.displayName || user?.username}!</span>
              <button
                onClick={logout}
                className="flex items-center bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md transition-colors"
              >
                <FaSignOutAlt className="mr-1" /> Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md transition-colors"
            >
              <FaSignInAlt className="mr-1" /> Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
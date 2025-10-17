// src/components/UserProfile.tsx
import React from 'react';
import { useAuth } from '../hooks/useAuth';

const UserProfile: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated || !user) {
    return (
      <div className="p-4">
        <p>You need to be logged in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">User Profile</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Username</label>
          <p className="mt-1 text-gray-900">{user.username}</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Display Name</label>
          <p className="mt-1 text-gray-900">{user.displayName}</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <p className="mt-1 text-gray-900">{user.email}</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Roles</label>
          <p className="mt-1 text-gray-900">{user.roles.join(', ') || 'No roles assigned'}</p>
        </div>
      </div>
      
      <div className="mt-6">
        <button
          onClick={logout}
          className="w-full py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default UserProfile;
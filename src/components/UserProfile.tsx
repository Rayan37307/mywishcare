// src/components/UserProfile.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';

const UserProfile: React.FC = () => {
  return <Navigate to="/profile" replace />;
};

export default UserProfile;
// src/components/LoginForm.tsx
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

interface LoginFormProps {
  onLoginSuccess?: () => void;
  showRegistration?: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({ 
  onLoginSuccess, 
  showRegistration = false 
}) => {
  const [isLogin, setIsLogin] = useState(!showRegistration);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState(''); // Used for registration
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [useAppPassword, setUseAppPassword] = useState(false);
  
  const { login, register, loading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLogin) {
      const result = await login(username, password, useAppPassword);
      if (result.success) {
        onLoginSuccess?.();
      }
    } else {
      const result = await register(username, email, password, displayName);
      if (result.success) {
        // Auto-switch to login after successful registration
        setIsLogin(true);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {isLogin ? 'Login' : 'Register'}
      </h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
            Username
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        {!isLogin && (
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required={!isLogin}
            />
          </div>
        )}
        
        {!isLogin && (
          <div className="mb-4">
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
              Display Name
            </label>
            <input
              type="text"
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
        
        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        {isLogin && (
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={useAppPassword}
                onChange={(e) => setUseAppPassword(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Use Application Password</span>
            </label>
            <p className="mt-1 text-xs text-gray-500">
              Check this if using Application Password instead of JWT
            </p>
          </div>
        )}
        
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
            loading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
        </button>
      </form>
      
      <div className="mt-4 text-center">
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          {isLogin 
            ? "Don't have an account? Register" 
            : "Already have an account? Login"}
        </button>
      </div>
    </div>
  );
};

export default LoginForm;
// src/components/LoginForm.tsx
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

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
  // Add state to track which registration method to use
  const [registrationMethod, setRegistrationMethod] = useState<'full' | 'request'>('full');
  
  const { login, register, requestRegistration, loading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLogin) {
      const result = await login(username, password, useAppPassword);
      if (result.success) {
        onLoginSuccess?.();
      }
    } else {
      // Determine which registration method to use
      if (registrationMethod === 'full') {
        const result = await register(username, email, password, displayName);
        if (result.success) {
          // Auto-switch to login after successful registration
          toast.success('Registration successful! Please login with your credentials.');
          setIsLogin(true);
        }
        // Error is already displayed through the error state in the form
      } else {
        // Request registration (for cases where full registration isn't enabled)
        const result = await requestRegistration(username, email, displayName);
        if (result.success) {
          toast.success('Registration request submitted! An administrator will review your request and contact you by email.');
          setIsLogin(true); // Switch back to login after request
        } else {
          // Show error message if request fails
          toast.error(result.message || 'Registration request failed. Please contact the administrator directly.');
        }
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
        
        {isLogin ? (
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
              required={isLogin}
            />
          </div>
        ) : (
          registrationMethod === 'full' && (
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
              <p className="mt-1 text-xs text-gray-500">
                Password must meet the site's requirements
              </p>
            </div>
          )
        )}
        
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
        
        {!isLogin && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Registration Method
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="registrationMethod"
                  checked={registrationMethod === 'full'}
                  onChange={() => setRegistrationMethod('full')}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Create Account</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="registrationMethod"
                  checked={registrationMethod === 'request'}
                  onChange={() => setRegistrationMethod('request')}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Request Access</span>
              </label>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {registrationMethod === 'full' 
                ? 'Attempt to create account directly (may require admin approval)' 
                : 'Send request to administrator for account creation'}
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
          {loading ? 'Processing...' : (isLogin ? 'Login' : registrationMethod === 'full' ? 'Register' : 'Request Access')}
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
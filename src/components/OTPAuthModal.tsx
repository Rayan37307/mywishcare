// src/components/OTPAuthModal.tsx
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';

interface OTPAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Function to get the API base URL with proper handling
const getApiUrl = (endpoint: string): string => {
  // Use the environment variable if available
  const envApiUrl = import.meta.env.VITE_WP_API_URL;
  
  if (envApiUrl) {
    // If it already includes /wp-json, use it directly
    if (envApiUrl.includes('/wp-json')) {
      // Ensure endpoint starts with /
      const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      return `${envApiUrl}${normalizedEndpoint}`;
    } else {
      // Otherwise append /wp-json and the endpoint
      const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      return `${envApiUrl.endsWith('/') ? envApiUrl : envApiUrl + '/'}wp-json${normalizedEndpoint}`;
    }
  }
  
  // Default to relative /wp-json for production
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `/wp-json${normalizedEndpoint}`;
};

// WordPress REST API auth service using correct endpoints from your setup
const wpAuthService = {
  login: async (email: string, password: string) => {
    try {
      // Using the JWT authentication endpoint from your setup
      const response = await fetch(getApiUrl('/jwt-auth/v1/token'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: email, // WordPress can accept email as username
          password: password,
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.token) {
        // Store token in localStorage
        localStorage.setItem('jwt_token', data.token);
        // Store user data correctly
        if (data.user) {
          localStorage.setItem('user_data', JSON.stringify(data.user));
          return { success: true, user: data.user, token: data.token };
        } else {
          // If user data is not in data.user, try to fetch it
          try {
            const userResponse = await fetch(getApiUrl('/wp/v2/users/me'), {
              headers: {
                'Authorization': `Bearer ${data.token}`,
                'Content-Type': 'application/json',
              },
            });
            
            if (userResponse.ok) {
              const userData = await userResponse.json();
              localStorage.setItem('user_data', JSON.stringify(userData));
              return { success: true, user: userData, token: data.token };
            }
          } catch (userError) {
            console.error('Error fetching user data:', userError);
          }
          
          // Return with minimal user data if we can't fetch full data
          return { success: true, user: { id: 0, username: email, email: email }, token: data.token };
        }
      } else {
        return { success: false, error: data.message || data.code || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error occurred' };
    }
  },
  
  register: async (email: string, password: string, username: string) => {
    try {
      // First try to register the user using WordPress built-in endpoint
      const response = await fetch(getApiUrl('/wp/v2/users'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          email: email,
          password: password,
          display_name: username, // Using username as display name
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.id) {
        // Login after successful registration
        return await wpAuthService.login(email, password);
      } else {
        // Check if it's a custom endpoint error
        if (data.code === 'rest_user_exists') {
          return { success: false, error: 'Username or email already exists' };
        }
        return { success: false, error: data.message || data.code || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Network error occurred' };
    }
  },
};

const OTPAuthModal: React.FC<OTPAuthModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(''); // For registration
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLogin, setIsLogin] = useState(true); // Switch between login and register

  const { refetchUser } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const result = await wpAuthService.login(email, password);
      if (result.success) {
        setMessage('Authenticated successfully! Redirecting...');
        refetchUser();
        setTimeout(onClose, 1500);
      } else {
        setError(result.error || 'Login failed');
      }
    } catch {
      setError('Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const result = await wpAuthService.register(email, password, username);
      if (result.success) {
        setMessage('Account created successfully! Redirecting...');
        refetchUser();
        setTimeout(onClose, 1500);
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch {
      setError('Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEmail('');
    setPassword('');
    setUsername('');
    setError('');
    setMessage('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/30">
       <button
      onClick={handleCancel}
      className="absolute top-6 right-6 z-50 bg-white/80 hover:bg-white text-gray-700 rounded-full shadow-md w-10 h-10 flex items-center justify-center backdrop-blur-md border border-gray-200 transition"
    >
      ✕
    </button>
      <div className="bg-gradient-to-b from-gray-900/20 via-[#EBE4FD] to-[#EBE4FD] p-6 backdrop-blur-[50px] rounded-lg w-full max-w-5xl h-auto overflow-hidden flex flex-col md:flex-row max-md:mx-7">
        {/* Left Image */}
        <div className="w-full md:w-2/3 flex items-center justify-center">
          <img
            src="/authlogo.png"
            alt="Authentication"
            className="w-[40%] h-auto object-cover"
            onError={(e) => {
              e.currentTarget.src =
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='300' viewBox='0 0 200 300'%3E%3Crect width='200' height='300' fill='%23e0e0e0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='14' fill='%23999'%3EAuthentication%3C/text%3E%3C/svg%3E";
            }}
          />
        </div>

        {/* Right Form */}
        <div className="w-full md:w-1/3 px-4 flex flex-col justify-center rounded-lg pt-5 bg-[#EBE4FD]">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">{error}</div>
          )}
          {message && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded text-sm">{message}</div>
          )}

          {isLogin ? (
            <form onSubmit={handleLogin} className="flex flex-col justify-center text-center">
              <div className="mb-4">
                <h1 className="text-xl text-center">Login</h1>
                <label
                  htmlFor="email"
                  className="block text-md font-medium text-gray-700 mb-8 mt-4"
                >
                  Email Address
                </label>

                <div className="flex items-center w-full border border-gray-300 bg-gray-50 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-indigo-400">
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 px-3 py-2 outline-none border-none bg-transparent"
                    placeholder="Enter Email Address"
                    required
                  />
                </div>
                
                <label
                  htmlFor="password"
                  className="block text-md font-medium text-gray-700 mb-8 mt-4"
                >
                  Password
                </label>

                <div className="flex items-center w-full border border-gray-300 bg-gray-50 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-indigo-400">
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="flex-1 px-3 py-2 outline-none border-none bg-transparent"
                    placeholder="Enter Password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full bg-transparent border border-gray-300 text-black font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 disabled:opacity-50"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="flex flex-col justify-center text-center">
              <div className="mb-4">
                <h1 className="text-xl text-center">Register</h1>
                <label
                  htmlFor="username"
                  className="block text-md font-medium text-gray-700 mb-8 mt-4"
                >
                  Username
                </label>

                <div className="flex items-center w-full border border-gray-300 bg-gray-50 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-indigo-400">
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="flex-1 px-3 py-2 outline-none border-none bg-transparent"
                    placeholder="Enter Username"
                    required
                  />
                </div>
                
                <label
                  htmlFor="email"
                  className="block text-md font-medium text-gray-700 mb-8 mt-4"
                >
                  Email Address
                </label>

                <div className="flex items-center w-full border border-gray-300 bg-gray-50 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-indigo-400">
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 px-3 py-2 outline-none border-none bg-transparent"
                    placeholder="Enter Email Address"
                    required
                  />
                </div>
                
                <label
                  htmlFor="password"
                  className="block text-md font-medium text-gray-700 mb-8 mt-4"
                >
                  Password
                </label>

                <div className="flex items-center w-full border border-gray-300 bg-gray-50 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-indigo-400">
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="flex-1 px-3 py-2 outline-none border-none bg-transparent"
                    placeholder="Enter Password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email || !password || !username}
                className="w-full bg-transparent border border-gray-300 text-black font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 disabled:opacity-50"
              >
                {loading ? 'Creating account...' : 'Register'}
              </button>
            </form>
          )}

          <p className="mt-4 text-xs text-gray-500 text-center">
            <a 
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setIsLogin(!isLogin);
              }}
              className="underline"
            >
              {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
            </a>
          </p>
          
          <p className="mt-4 text-xs text-gray-500 text-center">
            I accept that I have read & understood Gokwik's Privacy Policy and T&Cs.
          </p>
          <Link
            to="/"
            className="underline text-xs text-center text-gray-400 mt-10 mb-4"
          >
            Trouble logging in?
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OTPAuthModal;
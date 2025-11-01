// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { wpAuthService } from '../services/authService';
import type { User } from '../types/user';
import toast from 'react-hot-toast';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
    isAuthenticated: false,
  });

  // Check authentication status on mount
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const user = wpAuthService.getCurrentUser();
        const isAuthenticated = wpAuthService.isAuthenticated();
        
        setAuthState({
          user: user,
          loading: false,
          error: null,
          isAuthenticated: isAuthenticated,
        });
      } catch (error) {
        console.error('Auth status check error:', error);
        const errorMessage = (error as Error).message || 'Auth check failed';
        setAuthState({
          user: null,
          loading: false,
          error: errorMessage,
          isAuthenticated: false,
        });
        // Only show toast if there's a specific error (not just an unauthenticated state)
        if (errorMessage !== 'Auth check failed') {
          toast.error('Error checking authentication status');
        }
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (username: string, password: string, useAppPassword: boolean = false) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = useAppPassword 
        ? await wpAuthService.loginWithAppPassword(username, password)
        : await wpAuthService.login(username, password);

      if (result.error) {
        setAuthState({
          user: null,
          loading: false,
          error: result.error || null,
          isAuthenticated: false,
        });
        
        // Provide specific toast messages for different error types
        const errorLower = result.error.toLowerCase();
        if (errorLower.includes('invalid username') || errorLower.includes('incorrect password') || errorLower.includes('password you entered')) {
          toast.error('Invalid email or password. Please try again.');
        } else if (errorLower.includes('email') || errorLower.includes('username')) {
          toast.error('Please enter a valid email address.');
        } else if (errorLower.includes('password')) {
          toast.error('Password is incorrect. Please try again.');
        } else {
          toast.error('Login failed. Please try again.');
        }
        
        return { success: false, error: result.error || null };
      }

      setAuthState({
        user: result.user || null,
        loading: false,
        error: null,
        isAuthenticated: !!result.user,
      });

      // Reload the page after successful login
      if (result.user) {
        toast.success('Login successful! Redirecting...');
        window.location.reload();
      }

      return { success: true, user: result.user };
    } catch (error) {
      const errorMessage = (error as Error).message || 'Login failed';
      setAuthState({
        user: null,
        loading: false,
        error: errorMessage,
        isAuthenticated: false,
      });
      toast.error('Login failed. Please try again.');
      return { success: false, error: errorMessage };
    }
  };

  const register = async (username: string, email: string, password: string, displayName?: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await wpAuthService.register(username, email, password, displayName);

      if (result.error) {
        setAuthState(prev => ({ ...prev, loading: false, error: result.error || null, isAuthenticated: false, user: null }));
        
        // Provide specific toast messages for different error types
        const errorLower = result.error.toLowerCase();
        if (errorLower.includes('email') || errorLower.includes('already exists')) {
          toast.error('Email already exists. Please use a different email.');
        } else if (errorLower.includes('username') || errorLower.includes('login name') || errorLower.includes('login name is already')) {
          toast.error('Username already taken. Please choose a different one.');
        } else if (errorLower.includes('password')) {
          toast.error('Password is too weak. Please use a stronger password.');
        } else if (errorLower.includes('registration')) {
          toast.error('Registration is not available at this time. Please contact the site administrator.');
        } else {
          toast.error('Registration failed. Please try again.');
        }
        
        return { success: false, error: result.error };
      }

      // Registration successful - user data returned
      setAuthState(prev => ({
        ...prev,
        user: result.user || null,
        loading: false,
        error: null,
        isAuthenticated: !!result.user, // Set to true if user object is returned
      }));

      // Reload the page after successful registration
      if (result.user) {
        toast.success('Account created successfully! Redirecting...');
        window.location.reload();
      }

      return { success: true, user: result.user };
    } catch (error) {
      const errorMessage = (error as Error).message || 'Registration failed';
      setAuthState({
        user: null,
        loading: false,
        error: errorMessage,
        isAuthenticated: false,
      });
      toast.error('Registration failed. Please try again.');
      return { success: false, error: errorMessage };
    }
  };

  // Alternative registration that doesn't require password (just sends request)
  const requestRegistration = async (username: string, email: string, displayName?: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await wpAuthService.requestRegistration(username, email, displayName);

      if (!result.success) {
        setAuthState(prev => ({ ...prev, loading: false, error: result.message, isAuthenticated: false }));
        return { success: false, message: result.message };
      }

      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: null,
      }));

      return { success: true, message: result.message };
    } catch (error) {
      const errorMessage = (error as Error).message || 'Registration request failed';
      setAuthState({
        user: null,
        loading: false,
        error: errorMessage,
        isAuthenticated: false,
      });
      return { success: false, message: errorMessage };
    }
  };

  const logout = () => {
    wpAuthService.logout();
    setAuthState({
      user: null,
      loading: false,
      error: null,
      isAuthenticated: false,
    });
    
    toast.success('Logged out successfully');
    
    // Reload the page after logout
    window.location.reload();
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!authState.user) {
      toast.error('No user authenticated');
      return { success: false, error: 'No user authenticated' };
    }

    try {
      const result = await wpAuthService.updateUser(authState.user.id, userData);

      if (result.error) {
        setAuthState(prev => ({ ...prev, error: result.error || null }));
        toast.error(result.error || 'Update failed');
        return { success: false, error: result.error || null };
      }

      if (result.user) {
        setAuthState(prev => ({ ...prev, user: result.user || prev.user }));
        toast.success('Profile updated successfully');
        return { success: true, user: result.user };
      }
    } catch (error) {
      const errorMessage = (error as Error).message || 'Update failed';
      setAuthState(prev => ({ ...prev, error: errorMessage }));
      toast.error('Profile update failed. Please try again.');
      return { success: false, error: errorMessage };
    }
  };

  return {
    ...authState,
    login,
    register,
    requestRegistration,
    logout,
    updateUser,
    refetchUser: () => {
      const user = wpAuthService.getCurrentUser();
      const isAuthenticated = wpAuthService.isAuthenticated();
      
      setAuthState(prev => ({
        ...prev,
        user,
        isAuthenticated,
      }));
    },
  };
};
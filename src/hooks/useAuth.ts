// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { wpAuthService } from '../services/authService';
import type { User } from '../types/user';

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
        setAuthState({
          user: null,
          loading: false,
          error: (error as Error).message || 'Auth check failed',
          isAuthenticated: false,
        });
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
          error: result.error,
          isAuthenticated: false,
        });
        return { success: false, error: result.error };
      }

      setAuthState({
        user: result.user || null,
        loading: false,
        error: null,
        isAuthenticated: !!result.user,
      });

      return { success: true, user: result.user };
    } catch (error) {
      const errorMessage = (error as Error).message || 'Login failed';
      setAuthState({
        user: null,
        loading: false,
        error: errorMessage,
        isAuthenticated: false,
      });
      return { success: false, error: errorMessage };
    }
  };

  const register = async (username: string, email: string, password: string, displayName?: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await wpAuthService.register(username, email, password, displayName);

      if (result.error) {
        setAuthState(prev => ({ ...prev, loading: false, error: result.error, isAuthenticated: false }));
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

      return { success: true, user: result.user };
    } catch (error) {
      const errorMessage = (error as Error).message || 'Registration failed';
      setAuthState({
        user: null,
        loading: false,
        error: errorMessage,
        isAuthenticated: false,
      });
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
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!authState.user) {
      return { success: false, error: 'No user authenticated' };
    }

    try {
      const result = await wpAuthService.updateUser(authState.user.id, userData);

      if (result.error) {
        setAuthState(prev => ({ ...prev, error: result.error || null }));
        return { success: false, error: result.error };
      }

      if (result.user) {
        setAuthState(prev => ({ ...prev, user: result.user || prev.user }));
        return { success: true, user: result.user };
      }
    } catch (error) {
      const errorMessage = (error as Error).message || 'Update failed';
      setAuthState(prev => ({ ...prev, error: errorMessage }));
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
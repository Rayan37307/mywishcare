// src/services/authService.ts
// Simple WordPress authentication service that can be easily removed later
import type { User } from "../types/user";

const WP_API_URL = import.meta.env.VITE_WP_API_URL || 'https://your-wordpress-site.com/wp-json';

class WordPressAuthService {
  private apiURL: string;

  constructor() {
    this.apiURL = WP_API_URL;
  }

  // Login using WordPress REST API
  async login(username: string, password: string): Promise<{ user?: User; token?: string; error?: string }> {
    try {
      // WordPress JWT Authentication
      const response = await fetch(`${this.apiURL}/jwt-auth/v1/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Authentication failed: ${response.status}`);
      }

      const data = await response.json();
      
      // Store JWT token and user info
      localStorage.setItem('wp_jwt_token', data.token);
      localStorage.setItem('wp_user', JSON.stringify(data.user));
      
      return { user: data.user, token: data.token };
    } catch (error) {
      console.error('Login error:', error);
      return { error: (error as Error).message || 'Login failed' };
    }
  }

  // Login using Application Passwords (alternative method)
  async loginWithAppPassword(username: string, password: string): Promise<{ user?: User; token?: string; error?: string }> {
    try {
      // Using WordPress Application Passwords
      const credentials = btoa(`${username}:${password}`);
      
      const response = await fetch(`${this.apiURL}/wp/v2/users/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.status} ${response.statusText}`);
      }

      const userData = await response.json();
      
      const user: User = {
        id: userData.id,
        username: userData.slug,
        email: userData.email,
        displayName: userData.name,
        roles: userData.roles || [],
      };

      // Store user data
      localStorage.setItem('wp_user', JSON.stringify(user));
      localStorage.setItem('wp_auth_token', credentials); // Store the basic auth credentials

      return { user, token: credentials };
    } catch (error) {
      console.error('App Password Login error:', error);
      return { error: (error as Error).message || 'Login failed' };
    }
  }

  // Register new user (requires custom endpoint or plugin)
  async register(username: string, email: string, password: string, displayName?: string): Promise<{ user?: User; error?: string }> {
    try {
      // Note: This endpoint might require a custom endpoint or plugin
      // Many WordPress sites don't allow registration via REST API by default
      const response = await fetch(`${this.apiURL}/wp/v2/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          password,
          name: displayName || username,
        }),
      });

      if (!response.ok) {
        throw new Error(`Registration failed: ${response.status} ${response.statusText}`);
      }

      const userData = await response.json();
      
      const user: User = {
        id: userData.id,
        username: userData.slug,
        email: userData.email,
        displayName: userData.name,
        roles: userData.roles || [],
      };

      return { user };
    } catch (error) {
      console.error('Registration error:', error);
      return { error: (error as Error).message || 'Registration failed' };
    }
  }

  // Logout
  logout(): void {
    localStorage.removeItem('wp_user');
    localStorage.removeItem('wp_auth_token');
    localStorage.removeItem('wp_jwt_token');
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('wp_user');
  }

  // Get current user
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('wp_user');
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  // Get auth token
  getToken(): string | null {
    return localStorage.getItem('wp_jwt_token') || localStorage.getItem('wp_auth_token') || null;
  }

  // Get auth headers
  getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    if (token) {
      // Check if it's a JWT token or basic auth
      if (token.startsWith('ey')) { // JWT typically starts with 'ey' (base64 encoded)
        return {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        };
      } else {
        return {
          'Authorization': `Basic ${token}`,
          'Content-Type': 'application/json',
        };
      }
    }
    return { 'Content-Type': 'application/json' };
  }

  // Update user profile
  async updateUser(userId: number, userData: Partial<User>): Promise<{ user?: User; error?: string }> {
    try {
      const response = await fetch(`${this.apiURL}/wp/v2/users/${userId}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error(`Update failed: ${response.status} ${response.statusText}`);
      }

      const updatedUser = await response.json();
      
      const user: User = {
        id: updatedUser.id,
        username: updatedUser.slug,
        email: updatedUser.email,
        displayName: updatedUser.name,
        roles: updatedUser.roles || [],
      };

      // Update stored user data
      localStorage.setItem('wp_user', JSON.stringify(user));

      return { user };
    } catch (error) {
      console.error('Update user error:', error);
      return { error: (error as Error).message || 'Update failed' };
    }
  }
}

export const wpAuthService = new WordPressAuthService();
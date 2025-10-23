// src/services/authService.ts
// Simple WordPress authentication service that can be easily removed later
import type { User } from "../types/user";

const WP_API_URL = import.meta.env.VITE_WP_API_URL || 'https://your-wordpress-site.com/wp-json';
const JWT_EXPIRY_BUFFER = 5 * 60 * 1000; // 5 minutes before expiry for refresh

class WordPressAuthService {
  private apiURL: string;

  constructor() {
    this.apiURL = WP_API_URL.replace('/wp-json', ''); // Remove /wp-json suffix for auth endpoints
  }

  // Login using WordPress REST API
  async login(username: string, password: string): Promise<{ user?: User; token?: string; error?: string }> {
    try {
      // WordPress JWT Authentication
      const response = await fetch(`${this.apiURL}/wp-json/jwt-auth/v1/token`, {
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
      const tokenPayload = this.parseJwt(data.token);
      localStorage.setItem('wp_jwt_token', data.token);
      localStorage.setItem('wp_jwt_expires_at', (Date.now() + (data.expires_in * 1000 - JWT_EXPIRY_BUFFER)).toString());
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
      
      const response = await fetch(`${this.apiURL}/wp-json/wp/v2/users/me`, {
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

  // Register new user - since WordPress doesn't have a built-in register endpoint,
  // we'll need to use a contact form plugin or a custom endpoint
  async register(username: string, email: string, password: string, displayName?: string): Promise<{ user?: User; error?: string }> {
    try {
      // Check if a custom registration endpoint exists
      // If not, we'll return an error directing the user to contact admin
      const response = await fetch(`${this.apiURL}/wp-json/custom/v1/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          password,
          display_name: displayName || username,
        }),
      });

      if (!response.ok) {
        // If the custom endpoint doesn't exist, we'll need to handle this differently
        if (response.status === 404) {
          // Check if registration is enabled in WordPress settings
          const optionsResponse = await fetch(`${this.apiURL}/wp-json/wp/v2/settings`);
          if (optionsResponse.ok) {
            const optionsData = await optionsResponse.json();
            if (optionsData.default_ping_status === 'open' && optionsData.users_can_register) {
              // WordPress allows registration, but we need to create a user via REST API
              // This requires proper permissions (admin authentication)
              throw new Error('Registration requires administrator privileges. Please contact site administrator.');
            } else {
              // Registration is disabled at WordPress level
              throw new Error('User registration is disabled on this site. Please contact the administrator.');
            }
          } else {
            throw new Error('Registration endpoint not found. Please contact site administrator.');
          }
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || `Registration failed: ${response.status}`);
        }
      }

      const userData = await response.json();
      
      const user: User = {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        displayName: userData.name,
        roles: userData.roles || [],
      };

      return { user };
    } catch (error) {
      console.error('Registration error:', error);
      
      // More user-friendly error message for registration issues
      if ((error as Error).message.includes('404') || (error as Error).message.includes('endpoint not found')) {
        return { 
          error: 'Self-registration is not available on this site. Please contact the administrator to create an account, or use the contact form if available.' 
        };
      }
      
      return { error: (error as Error).message || 'Registration failed' };
    }
  }

  // Alternative registration method using contact form or admin assistance
  async requestRegistration(username: string, email: string, displayName?: string): Promise<{ success: boolean; message: string }> {
    // This would depend on your WordPress setup
    // Common approaches: 
    // 1. Send an email to admin using a contact form plugin
    // 2. Create a custom endpoint that sends registration requests
    // 3. Redirect to a contact form
    
    return {
      success: false,
      message: 'Self-registration is not enabled. Please contact the site administrator to create an account, or use the contact form if available.'
    };
  }

  // Logout
  logout(): void {
    localStorage.removeItem('wp_user');
    localStorage.removeItem('wp_auth_token');
    localStorage.removeItem('wp_jwt_token');
    localStorage.removeItem('wp_jwt_expires_at');
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    // Check if JWT token is expired
    const expiresAt = localStorage.getItem('wp_jwt_expires_at');
    if (expiresAt && Date.now() > parseInt(expiresAt, 10)) {
      this.logout(); // Clean up expired tokens
      return false;
    }

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
    // Check if JWT token is expired before returning it
    const jwtToken = localStorage.getItem('wp_jwt_token');
    const expiresAt = localStorage.getItem('wp_jwt_expires_at');
    
    if (jwtToken && expiresAt) {
      if (Date.now() > parseInt(expiresAt, 10)) {
        // JWT token is expired, remove it
        localStorage.removeItem('wp_jwt_token');
        localStorage.removeItem('wp_jwt_expires_at');
        return null;
      }
      return jwtToken;
    }
    
    return localStorage.getItem('wp_auth_token') || null;
  }

  // Parse JWT to extract expiry time
  private parseJwt(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Error parsing JWT:', e);
      return null;
    }
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
      const response = await fetch(`${this.apiURL}/wp-json/wp/v2/users/${userId}`, {
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
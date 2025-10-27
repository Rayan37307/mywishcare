// src/services/authService.ts
// Simple WordPress authentication service that can be easily removed later
import type { User } from "../types/user";
import { APP_CONSTANTS } from "../constants/app";

const JWT_EXPIRY_BUFFER = 5 * 60 * 1000; // 5 minutes before expiry for refresh

class WordPressAuthService {
  private apiURL: string;

  constructor() {
    // Get the base WordPress API URL from environment variables
    const envApiUrl = import.meta.env.VITE_WP_API_URL;
    
    if (envApiUrl) {
      // If it already includes /wp-json, use it directly
      if (envApiUrl.includes('/wp-json')) {
        this.apiURL = envApiUrl;
      } else {
        // Otherwise append /wp-json
        this.apiURL = envApiUrl.endsWith('/') ? `${envApiUrl}wp-json` : `${envApiUrl}/wp-json`;
      }
    } else {
      // Default to relative path for production
      this.apiURL = '/wp-json';
    }
    
    console.log('WordPressAuthService initialized with API URL:', this.apiURL);
  }

  // Helper function to build API URL
  private buildApiUrl(endpoint: string): string {
    // Ensure endpoint starts with /
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    // Build the full URL
    const fullUrl = `${this.apiURL}${normalizedEndpoint}`;
    
    console.log(`Building API URL: ${fullUrl}`);
    return fullUrl;
  }

  // Login using WordPress REST API
  async login(username: string, password: string): Promise<{ user?: User; token?: string; error?: string }> {
    try {
      // WordPress JWT Authentication
      const response = await fetch(this.buildApiUrl('/jwt-auth/v1/token'), {
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
      
      // Ensure user data is properly structured
      let user: User;
      if (data.user) {
        // Use the user object from the response
        user = {
          id: data.user.id || data.user.ID,
          username: data.user.username || data.user.slug,
          email: data.user.email || data.user.user_email,
          displayName: data.user.name || data.user.display_name,
          roles: data.user.roles || data.user.roles || [],
        };
      } else {
        // Fallback: fetch user data separately if not included in token response
        const userResponse = await fetch(this.buildApiUrl('/wp/v2/users/me'), {
          headers: {
            'Authorization': `Bearer ${data.token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          user = {
            id: userData.id,
            username: userData.slug,
            email: userData.email,
            displayName: userData.name,
            roles: userData.roles || [],
          };
        } else {
          throw new Error('Could not retrieve user information after login');
        }
      }
      
      // Store JWT token and user info
      const tokenPayload = this.parseJwt(data.token);
      
      // Calculate expiration time based on expires_in from the response
      let expiresAt;
      if (data.expires_in && typeof data.expires_in === 'number') {
        expiresAt = Date.now() + (data.expires_in * 1000 - JWT_EXPIRY_BUFFER);
      } else {
        // Fallback: use token's exp claim if available or default to 7 days
        if (tokenPayload && tokenPayload.exp) {
          expiresAt = tokenPayload.exp * 1000 - JWT_EXPIRY_BUFFER;
        } else {
          expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days
        }
      }
      
      localStorage.setItem(APP_CONSTANTS.JWT_TOKEN_STORAGE_KEY, data.token);
      localStorage.setItem('wp_jwt_expires_at', expiresAt.toString());
      localStorage.setItem(APP_CONSTANTS.USER_STORAGE_KEY, JSON.stringify(user));
      
      return { user, token: data.token };
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
      
      const response = await fetch(this.buildApiUrl('/wp/v2/users/me'), {
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
      localStorage.setItem(APP_CONSTANTS.USER_STORAGE_KEY, JSON.stringify(user));
      localStorage.setItem(APP_CONSTANTS.AUTH_TOKEN_STORAGE_KEY, credentials); // Store the basic auth credentials

      return { user, token: credentials };
    } catch (error) {
      console.error('App Password Login error:', error);
      return { error: (error as Error).message || 'Login failed' };
    }
  }

  // Register new user - since WordPress doesn't have a built-in register endpoint,
  // we'll need to use a custom endpoint or handle registration differently
  async register(username: string, email: string, password: string, displayName?: string): Promise<{ user?: User; error?: string }> {
    try {
      // First, check if the custom registration endpoint exists
      const response = await fetch(this.buildApiUrl('/custom/v1/register'), {
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
        // If the custom endpoint doesn't exist, check if registration is enabled in WordPress
        if (response.status === 404) {
          try {
            // Try to check WordPress registration settings
            const optionsResponse = await fetch(this.buildApiUrl('/wp/v2/settings'), {
              headers: {
                'Content-Type': 'application/json',
              }
            });
            
            if (optionsResponse.ok) {
              const optionsData = await optionsResponse.json();
              
              // Check if user registration is allowed
              if (optionsData.users_can_register) {
                // WordPress allows registration, but we need to use the admin-based approach
                // which requires authentication with admin credentials
                return {
                  error: 'Self-registration is not configured. An administrator is required to create accounts. Please contact the site administrator or use the contact form if available.'
                };
              } else {
                // Registration is disabled at WordPress level
                return {
                  error: 'User registration is currently disabled on this site. Please contact the administrator.'
                };
              }
            } else {
              // If we can't access settings, provide a general error
              return {
                error: 'Registration is not available at this time. The registration functionality may not be properly configured. Please contact the site administrator.'
              };
            }
          } catch (settingsError) {
            console.error('Error checking registration settings:', settingsError);
            // If settings request fails (possibly due to authentication), return helpful message
            return {
              error: 'Registration is not available. The registration endpoint could not be found. Please contact the site administrator for assistance.'
            };
          }
        } else {
          // Handle other HTTP errors
          let errorMessage = `Registration failed: ${response.status}`;
          try {
            const errorData = await response.json();
            if (errorData.message) {
              errorMessage = errorData.message;
            }
          } catch (e) {
            // If we can't parse error response, use the status-based message
          }
          
          throw new Error(errorMessage);
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

      // After successful registration, try to log the user in automatically
      // This will store the JWT token and user info in localStorage
      // First, try to log in with the new credentials
      try {
        const loginResponse = await fetch(this.buildApiUrl('/jwt-auth/v1/token'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username,
            password,
          }),
        });

        if (loginResponse.ok) {
          const loginData = await loginResponse.json();
          
          // Store JWT token and user info to automatically log the user in
          const tokenPayload = this.parseJwt(loginData.token);
          
          // Calculate expiration time based on expires_in from the response
          let expiresAt;
          if (loginData.expires_in && typeof loginData.expires_in === 'number') {
            expiresAt = Date.now() + (loginData.expires_in * 1000 - JWT_EXPIRY_BUFFER);
          } else {
            // Fallback: use token's exp claim if available or default to 7 days
            if (tokenPayload && tokenPayload.exp) {
              expiresAt = tokenPayload.exp * 1000 - JWT_EXPIRY_BUFFER;
            } else {
              expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days
            }
          }
          
          localStorage.setItem(APP_CONSTANTS.JWT_TOKEN_STORAGE_KEY, loginData.token);
          localStorage.setItem('wp_jwt_expires_at', expiresAt.toString());
          localStorage.setItem(APP_CONSTANTS.USER_STORAGE_KEY, JSON.stringify(user));
        }
      } catch (loginError) {
        console.error('Auto-login after registration failed:', loginError);
        // Even if auto-login fails, we still return the user data from registration
      }

      return { user };
    } catch (error) {
      console.error('Registration error:', error);
      
      // Check if this is a network error or similar
      if (error instanceof TypeError) {
        return {
          error: 'Unable to connect to the registration service. Please check your internet connection and try again.'
        };
      }
      
      return { 
        error: (error as Error).message || 'An unexpected error occurred during registration. Please try again later.' 
      };
    }
  }

  // Alternative registration method using contact form or admin assistance
  async requestRegistration(username: string, email: string, displayName?: string): Promise<{ success: boolean; message: string }> {
    // In a real implementation, this would send a registration request
    // to an endpoint that notifies the administrator
    
    // For now, provide a clear instruction to the user
    return {
      success: false,
      message: 'Self-registration is not enabled. An administrator will need to create your account. Please contact the site administrator directly or use any available contact form.'
    };
  }

  // Logout
  logout(): void {
    localStorage.removeItem(APP_CONSTANTS.USER_STORAGE_KEY);
    localStorage.removeItem(APP_CONSTANTS.AUTH_TOKEN_STORAGE_KEY);
    localStorage.removeItem(APP_CONSTANTS.JWT_TOKEN_STORAGE_KEY);
    localStorage.removeItem('wp_jwt_expires_at');
    
    // Dispatch a storage event to notify other tabs/components about the logout
    // This will trigger the useEffect in OrderContext to clear orders
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'wp_jwt_token',
      oldValue: 'token-present',
      newValue: null,
    }));
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    // Check if JWT token is expired
    const expiresAt = localStorage.getItem('wp_jwt_expires_at');
    if (expiresAt && !isNaN(parseInt(expiresAt, 10)) && Date.now() > parseInt(expiresAt, 10)) {
      this.logout(); // Clean up expired tokens
      return false;
    }

    // Check if user data exists and is valid
    const userStr = localStorage.getItem(APP_CONSTANTS.USER_STORAGE_KEY);
    if (!userStr || userStr === 'undefined' || userStr === 'null') {
      return false;
    }

    try {
      const user = JSON.parse(userStr);
      return user && typeof user === 'object' && user.id;
    } catch {
      return false;
    }
  }

  // Get current user
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem(APP_CONSTANTS.USER_STORAGE_KEY);
    if (!userStr || userStr === 'undefined' || userStr === 'null') return null;

    try {
      const user = JSON.parse(userStr);
      return user && typeof user === 'object' && user.id ? user : null;
    } catch {
      return null;
    }
  }

  // Get auth token
  getToken(): string | null {
    // Check if JWT token is expired before returning it
    const jwtToken = localStorage.getItem(APP_CONSTANTS.JWT_TOKEN_STORAGE_KEY);
    const expiresAt = localStorage.getItem('wp_jwt_expires_at');
    
    if (jwtToken && expiresAt) {
      if (Date.now() > parseInt(expiresAt, 10)) {
        // JWT token is expired, remove it
        localStorage.removeItem(APP_CONSTANTS.JWT_TOKEN_STORAGE_KEY);
        localStorage.removeItem('wp_jwt_expires_at');
        return null;
      }
      return jwtToken;
    }
    
    return localStorage.getItem(APP_CONSTANTS.AUTH_TOKEN_STORAGE_KEY) || null;
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
      const response = await fetch(this.buildApiUrl(`/wp/v2/users/${userId}`), {
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
        username: updatedUser.slug || updatedUser.username,
        email: updatedUser.email,
        displayName: updatedUser.name || updatedUser.display_name,
        roles: updatedUser.roles || [],
      };

      // Update stored user data
      localStorage.setItem(APP_CONSTANTS.USER_STORAGE_KEY, JSON.stringify(user));

      return { user };
    } catch (error) {
      console.error('Update user error:', error);
      return { error: (error as Error).message || 'Update failed' };
    }
  }
}

export const wpAuthService = new WordPressAuthService();
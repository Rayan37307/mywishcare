// src/services/otpAuthService.ts
import type { User } from "../types/user";
import { wpAuthService } from "./authService";

// Get the proper API base URL
const getApiBaseUrl = () => {
  const envApiUrl = import.meta.env.VITE_WP_API_URL;
  
  if (envApiUrl) {
    // Make sure it ends with /wp-json if it's a custom URL
    if (envApiUrl.includes('/wp-json')) {
      return envApiUrl.replace('/wp-json', ''); // Remove wp-json to get base URL
    } else {
      return envApiUrl.endsWith('/') ? envApiUrl.slice(0, -1) : envApiUrl;
    }
  }
  
  // Default to relative path for local/relative API access (empty string for relative)
  return '';
};

class OTPAuthService {
  private apiURL: string;

  constructor() {
    this.apiURL = getApiBaseUrl();
  }

  // Helper function to build API URL
  private buildApiUrl(endpoint: string): string {
    if (!this.apiURL) {
      // If apiURL is empty (for relative paths), return the endpoint directly
      return `/wp-json${endpoint}`;
    }
    
    // If apiURL already contains wp-json, just append the endpoint
    if (this.apiURL.includes('/wp-json')) {
      return `${this.apiURL}${endpoint}`;
    }
    
    // Otherwise append /wp-json and the endpoint
    return `${this.apiURL.endsWith('/') ? this.apiURL : `${this.apiURL}/`}wp-json${endpoint}`;
  }

  // Send OTP to email
  async sendOTP(email: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      // Use WordPress OTP endpoint to send OTP
      const response = await fetch(this.buildApiUrl('/otp/v1/send'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to send OTP: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      return { 
        success: true, 
        message: data.message || 'OTP sent successfully' 
      };
    } catch (error) {
      console.error('Send OTP error:', error);
      return { 
        success: false, 
        error: (error as Error).message || 'Error sending OTP' 
      };
    }
  }

  // Verify OTP and authenticate user
  async verifyOTP(email: string, otp: string): Promise<{ user?: User; token?: string; error?: string }> {
    try {
      // Use WordPress OTP endpoint to verify OTP and get JWT token
      const response = await fetch(this.buildApiUrl('/otp/v1/verify'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to verify OTP: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.user || !data.token) {
        throw new Error('Invalid response from server');
      }

      // Store JWT token and user info
      localStorage.setItem('wp_jwt_token', data.token);
      localStorage.setItem('wp_user', JSON.stringify(data.user));
      
      return { 
        user: data.user, 
        token: data.token 
      };
    } catch (error) {
      console.error('Verify OTP error:', error);
      return { 
        error: (error as Error).message || 'Error verifying OTP' 
      };
    }
  }

  // Check if user is authenticated using existing JWT token
  isAuthenticated(): boolean {
    return wpAuthService.isAuthenticated();
  }

  // Get current user
  getCurrentUser(): User | null {
    return wpAuthService.getCurrentUser();
  }

  // Get auth token
  getToken(): string | null {
    return wpAuthService.getToken();
  }

  // Logout
  logout(): void {
    wpAuthService.logout();
  }
}

export const otpAuthService = new OTPAuthService();
// src/services/otpAuthService.ts
import type { User } from "../types/user";
import { wpAuthService } from "./authService";

const WP_API_URL = import.meta.env.VITE_WP_API_URL || 'https://your-wordpress-site.com/wp-json';

class OTPAuthService {
  private apiURL: string;

  constructor() {
    this.apiURL = WP_API_URL.replace('/wp-json', '');
  }

  // Send OTP to email
  async sendOTP(email: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      // Use WordPress OTP endpoint to send OTP
      const response = await fetch(`${this.apiURL}/wp-json/otp/v1/send`, {
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
      const response = await fetch(`${this.apiURL}/wp-json/otp/v1/verify`, {
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
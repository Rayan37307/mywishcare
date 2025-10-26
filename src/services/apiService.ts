// src/services/apiService.ts
// Unified API service for handling WordPress REST API requests

class ApiService {
  private apiBase: string;
  
  constructor() {
    // Get the base WordPress API URL from environment variables
    const envApiUrl = import.meta.env.VITE_WP_API_URL;
    
    if (envApiUrl) {
      // If it already includes /wp-json, use it directly
      if (envApiUrl.includes('/wp-json')) {
        this.apiBase = envApiUrl;
      } else {
        // Otherwise append /wp-json
        this.apiBase = envApiUrl.endsWith('/') ? `${envApiUrl}wp-json` : `${envApiUrl}/wp-json`;
      }
    } else {
      // Default to relative path for production
      this.apiBase = '/wp-json';
    }
    
    console.log('ApiService initialized with base URL:', this.apiBase);
  }
  
  // Build URL with proper endpoint construction
  buildUrl(endpoint: string): string {
    // Ensure endpoint starts with /
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    // Build the full URL
    const fullUrl = `${this.apiBase}${normalizedEndpoint}`;
    
    console.log(`Building API URL: ${fullUrl}`);
    return fullUrl;
  }
  
  // Get authentication headers
  getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('wp_jwt_token');
    return token 
      ? { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      : { 'Content-Type': 'application/json' };
  }
  
  // Generic fetch method with proper error handling
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = this.buildUrl(endpoint);
    
    const defaultOptions: RequestInit = {
      headers: this.getAuthHeaders(),
    };
    
    const mergedOptions: RequestInit = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };
    
    try {
      console.log(`Making API request to: ${url}`);
      const response = await fetch(url, mergedOptions);
      
      console.log(`API response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API error response: ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data: T = await response.json();
        return data;
      } else {
        // Handle non-JSON responses
        return response.text() as unknown as T;
      }
    } catch (error) {
      console.error(`Error making API request to ${url}:`, error);
      throw error;
    }
  }
  
  // GET method
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'GET',
    });
  }
  
  // POST method
  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  
  // PUT method
  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
  
  // DELETE method
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();
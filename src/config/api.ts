// API Configuration
const getApiBaseUrl = (): string => {
  // Use the environment variable if available
  const envApiUrl = import.meta.env.VITE_WP_API_URL;
  
  if (envApiUrl) {
    // Make sure it ends with /wp-json if it's a custom URL
    if (envApiUrl.includes('/wp-json')) {
      return envApiUrl;
    } else {
      return envApiUrl.endsWith('/') ? `${envApiUrl}wp-json` : `${envApiUrl}/wp-json`;
    }
  }
  
  // Default to relative /wp-json for production
  return '/wp-json';
};

export const API_BASE_URL = getApiBaseUrl();
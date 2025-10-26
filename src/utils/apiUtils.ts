// src/utils/apiUtils.ts
export const buildWooCommerceAPIURL = (endpoint: string, params: Record<string, string> = {}): string => {
  const baseURL = import.meta.env.VITE_WP_API_URL || 'https://sajcaree.com/wp-json';
  const consumerKey = import.meta.env.VITE_WC_CONSUMER_KEY || 'ck_23112f91dee60de7b243c658e5f4ddbb5250b745';
  const consumerSecret = import.meta.env.VITE_WC_CONSUMER_SECRET || 'cs_bb75d74565ffe29d3f47ea79948397214d7fb18a';
  
  // Build the full endpoint path
  const apiEndpoint = `/wc/v3${endpoint}`;
  
  // Add consumer key and secret to params
  const queryParams = new URLSearchParams({
    ...params,
    consumer_key: consumerKey,
    consumer_secret: consumerSecret
  });
  
  // Construct the full URL
  const fullURL = `${baseURL}${apiEndpoint}?${queryParams}`;
  console.log(`Built WooCommerce API URL: ${fullURL}`);
  
  return fullURL;
};

export const testWooCommerceAPI = async (): Promise<any> => {
  try {
    const testURL = buildWooCommerceAPIURL('/products', { per_page: '5' });
    console.log(`Testing WooCommerce API with URL: ${testURL}`);
    
    const response = await fetch(testURL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    console.log(`API Response Status: ${response.status}`);
    console.log(`API Response Headers:`, [...response.headers.entries()]);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error Response: ${errorText}`);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    console.log(`API Success Response with ${data.length} products`);
    
    return {
      success: true,
      status: response.status,
      data: data,
      count: data.length
    };
  } catch (error) {
    console.error('WooCommerce API Test Error:', error);
    throw error;
  }
};
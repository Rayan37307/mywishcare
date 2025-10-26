// src/tests/api-test.ts
export const testWooCommerceConnection = async () => {
  try {
    // Get environment variables
    const wpApiUrl = import.meta.env.VITE_WP_API_URL;
    const wcConsumerKey = import.meta.env.VITE_WC_CONSUMER_KEY;
    const wcConsumerSecret = import.meta.env.VITE_WC_CONSUMER_SECRET;
    
    console.log('Environment variables:');
    console.log('- WP API URL:', wpApiUrl);
    console.log('- WC Consumer Key:', wcConsumerKey);
    console.log('- WC Consumer Secret:', wcConsumerSecret ? '[REDACTED]' : 'NOT SET');
    
    if (!wpApiUrl || !wcConsumerKey || !wcConsumerSecret) {
      throw new Error('Missing required environment variables');
    }
    
    // Build the API endpoint
    const endpoint = `${wpApiUrl}/wc/v3/products?per_page=5&consumer_key=${wcConsumerKey}&consumer_secret=${wcConsumerSecret}`;
    console.log('Testing endpoint:', endpoint);
    
    // Test the connection
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    console.log('Response status:', response.status);
    console.log('Response headers:', [...response.headers.entries()]);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const products = await response.json();
    console.log(`Successfully fetched ${products.length} products`);
    
    return {
      success: true,
      products: products,
      count: products.length
    };
  } catch (error: any) {
    console.error('WooCommerce connection test failed:', error);
    
    if (error.name === 'AbortError') {
      throw new Error('Request timed out after 10 seconds');
    }
    
    throw error;
  }
};
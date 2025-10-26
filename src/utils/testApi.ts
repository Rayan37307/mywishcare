// src/utils/testApi.ts
// Utility to test API endpoints

export const testApiEndpoints = async () => {
  try {
    // Test base WordPress API
    console.log('Testing WordPress base API...');
    const wpResponse = await fetch('/wp-json');
    console.log('WordPress API Response:', wpResponse.status, await wpResponse.json());
    
    // Test WooCommerce API
    console.log('Testing WooCommerce API...');
    const wcResponse = await fetch('/wp-json/wc/v3/products?per_page=5');
    console.log('WooCommerce API Response:', wcResponse.status, await wcResponse.json());
    
    // Test JWT Auth endpoint
    console.log('Testing JWT Auth endpoint...');
    const jwtResponse = await fetch('/wp-json/jwt-auth/v1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'test@example.com',
        password: 'testpassword',
      }),
    });
    console.log('JWT Auth Response:', jwtResponse.status, await jwtResponse.json());
  } catch (error) {
    console.error('API Test Error:', error);
  }
};
// src/components/ApiTest.tsx
import React, { useState, useEffect } from 'react';

const ApiTest: React.FC = () => {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const testEndpoints = async () => {
    setLoading(true);
    setError('');
    setResults(null);
    
    try {
      // Test base WordPress API
      console.log('Testing WordPress base API...');
      const wpResponse = await fetch('/wp-json');
      const wpData = await wpResponse.json();
      console.log('WordPress API Response:', wpResponse.status, wpData);
      
      // Test WooCommerce API
      console.log('Testing WooCommerce API...');
      const wcResponse = await fetch('/wp-json/wc/v3/products?per_page=5');
      const wcData = await wcResponse.json();
      console.log('WooCommerce API Response:', wcResponse.status, wcData);
      
      // Test authentication endpoint
      console.log('Testing authentication endpoint...');
      // We won't actually authenticate, just check if the endpoint exists
      const authResponse = await fetch('/wp-json/jwt-auth/v1/token', {
        method: 'OPTIONS'
      });
      console.log('Auth endpoint status:', authResponse.status);
      
      setResults({
        wp: {
          status: wpResponse.status,
          data: wpData
        },
        wc: {
          status: wcResponse.status,
          data: wcData.slice(0, 3) // Just first 3 products
        },
        auth: {
          status: authResponse.status
        }
      });
    } catch (err) {
      console.error('API Test Error:', err);
      setError(`API Test Error: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testEndpoints();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">API Endpoint Test</h1>
      
      <button 
        onClick={testEndpoints}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded mb-4 disabled:bg-gray-400"
      >
        {loading ? 'Testing...' : 'Test API Endpoints'}
      </button>
      
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {results && (
        <div className="space-y-4">
          <div className="p-4 bg-gray-100 rounded">
            <h2 className="text-lg font-semibold mb-2">WordPress API</h2>
            <p>Status: {results.wp.status}</p>
            {results.wp.data && (
              <pre className="text-xs mt-2 p-2 bg-white rounded max-h-40 overflow-auto">
                {JSON.stringify(results.wp.data, null, 2)}
              </pre>
            )}
          </div>
          
          <div className="p-4 bg-gray-100 rounded">
            <h2 className="text-lg font-semibold mb-2">WooCommerce API</h2>
            <p>Status: {results.wc.status}</p>
            {results.wc.data && (
              <pre className="text-xs mt-2 p-2 bg-white rounded max-h-40 overflow-auto">
                {JSON.stringify(results.wc.data, null, 2)}
              </pre>
            )}
          </div>
          
          <div className="p-4 bg-gray-100 rounded">
            <h2 className="text-lg font-semibold mb-2">Authentication API</h2>
            <p>Status: {results.auth.status}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiTest;
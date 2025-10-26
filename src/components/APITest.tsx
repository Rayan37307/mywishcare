// src/components/APITest.tsx
import React, { useState } from 'react';

const APITest: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testAPIConnection = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      // Test direct API connection
      const apiUrl = import.meta.env.VITE_WP_API_URL + '/wc/v3/products';
      const consumerKey = import.meta.env.VITE_WC_CONSUMER_KEY;
      const consumerSecret = import.meta.env.VITE_WC_CONSUMER_SECRET;
      
      const url = `${apiUrl}?consumer_key=${consumerKey}&consumer_secret=${consumerSecret}&per_page=5`;
      
      console.log('Testing API connection with URL:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      
      setResult({
        success: true,
        status: response.status,
        data: data,
        count: data.length
      });
    } catch (err: any) {
      console.error('API Test Error:', err);
      setError(err.message || 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">API Connection Test</h2>
      
      <button
        onClick={testAPIConnection}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded mb-4 disabled:bg-gray-400"
      >
        {loading ? 'Testing...' : 'Test API Connection'}
      </button>
      
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {result && (
        <div className="p-4 bg-green-100 text-green-700 rounded">
          <strong>Success!</strong> Found {result.count} products.
          <details className="mt-2">
            <summary>Response Details</summary>
            <pre className="text-xs mt-2 p-2 bg-white rounded max-h-60 overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
};

export default APITest;
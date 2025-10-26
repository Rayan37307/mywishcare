// src/pages/APIDebugPage.tsx
import React, { useState } from 'react';
import { woocommerceService } from '../services/woocommerceService';
import { testWooCommerceAPI } from '../utils/apiUtils';

const APIDebugPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testProducts = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    
    try {
      console.log('Starting products test...');
      const products = await woocommerceService.fetchProducts();
      console.log('Products fetched successfully:', products);
      setResponse({
        type: 'products',
        data: products,
        count: products.length
      });
    } catch (err: any) {
      console.error('Error in testProducts:', err);
      setError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const testProductById = async (id: number) => {
    setLoading(true);
    setError(null);
    setResponse(null);
    
    try {
      console.log(`Starting product ${id} test...`);
      const product = await woocommerceService.fetchProductById(id, true);
      console.log(`Product ${id} fetched successfully:`, product);
      setResponse({
        type: 'product',
        data: product
      });
    } catch (err: any) {
      console.error(`Error in testProductById for ${id}:`, err);
      setError(err.message || 'Failed to fetch product');
    } finally {
      setLoading(false);
    }
  };

  const testSearch = async (term: string) => {
    setLoading(true);
    setError(null);
    setResponse(null);
    
    try {
      console.log(`Starting search test for "${term}"...`);
      const products = await woocommerceService.searchProducts(term);
      console.log(`Search for "${term}" completed:`, products);
      setResponse({
        type: 'search',
        data: products,
        count: products.length,
        term: term
      });
    } catch (err: any) {
      console.error(`Error in testSearch for "${term}":`, err);
      setError(err.message || 'Failed to search products');
    } finally {
      setLoading(false);
    }
  };

  const testDirectAPI = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    
    try {
      console.log('Starting direct API test...');
      const result = await testWooCommerceAPI();
      console.log('Direct API test completed:', result);
      setResponse({
        type: 'direct_api',
        data: result
      });
    } catch (err: any) {
      console.error('Error in testDirectAPI:', err);
      setError(err.message || 'Failed to test direct API');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">WooCommerce API Debug</h1>
      
      <div className="mb-8 p-4 bg-gray-100 rounded">
        <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={testProducts}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
          >
            {loading ? 'Testing...' : 'Test All Products'}
          </button>
          
          <button
            onClick={() => testProductById(13)}
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded disabled:bg-gray-400"
          >
            {loading ? 'Testing...' : 'Test Product #13'}
          </button>
          
          <button
            onClick={() => testProductById(999999)}
            disabled={loading}
            className="px-4 py-2 bg-purple-500 text-white rounded disabled:bg-gray-400"
          >
            {loading ? 'Testing...' : 'Test Invalid Product'}
          </button>
          
          <button
            onClick={() => testSearch('sun')}
            disabled={loading}
            className="px-4 py-2 bg-orange-500 text-white rounded disabled:bg-gray-400"
          >
            {loading ? 'Testing...' : 'Search "sun"'}
          </button>
          
          <button
            onClick={testDirectAPI}
            disabled={loading}
            className="px-4 py-2 bg-red-500 text-white rounded disabled:bg-gray-400"
          >
            {loading ? 'Testing...' : 'Test Direct API'}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-800 rounded">
          <h3 className="font-bold text-lg mb-2">Error:</h3>
          <p>{error}</p>
        </div>
      )}
      
      {response && (
        <div className="p-4 bg-gray-50 rounded">
          <h3 className="font-bold text-lg mb-2">Response:</h3>
          <pre className="text-sm overflow-auto max-h-96 bg-white p-4 rounded">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default APIDebugPage;
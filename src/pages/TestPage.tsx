// src/pages/TestPage.tsx
import React, { useState } from 'react';
import { testWooCommerceConnection } from '../tests/api-test';

const TestPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const runTest = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const testResult = await testWooCommerceConnection();
      setResult(testResult);
    } catch (err: any) {
      setError(err.message || 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">API Connection Test</h1>
      
      <button
        onClick={runTest}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded mb-4 disabled:bg-gray-400"
      >
        {loading ? 'Testing...' : 'Run Connection Test'}
      </button>
      
      {error && (
        <div className="p-4 bg-red-100 text-red-800 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {result && (
        <div className="p-4 bg-green-100 text-green-800 rounded">
          <strong>Success!</strong> Fetched {result.count} products.
          <details className="mt-2">
            <summary>See details</summary>
            <pre className="mt-2 p-2 bg-white rounded text-sm overflow-auto max-h-60">
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
};

export default TestPage;
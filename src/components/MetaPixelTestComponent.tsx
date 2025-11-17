// components/MetaPixelTestComponent.tsx
// Test component to verify server-side and client-side Meta Pixel tracking

import React from 'react';
import { pixelYourSiteService, type MetaPixelUserData } from '../services/pixelYourSiteService';

const MetaPixelTestComponent: React.FC = () => {
  const [testResults, setTestResults] = React.useState<string[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const addToResults = (message: string) => {
    setTestResults(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const testPageView = async () => {
    setIsLoading(true);
    try {
      const userData: MetaPixelUserData = {
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        city: 'Dhaka',
        country: 'BD'
      };
      
      await pixelYourSiteService.trackPageView('Test Page', window.location.href, userData);
      addToResults('✓ PageView event sent (both client and server-side)');
    } catch (error) {
      addToResults(`✗ PageView failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testProductView = async () => {
    setIsLoading(true);
    try {
      const userData: MetaPixelUserData = {
        email: 'test@example.com'
      };
      
      await pixelYourSiteService.trackProductView({
        product_id: 'test_product_1',
        product_name: 'Test Product',
        product_price: 29.99,
        currency: 'USD',
        value: 29.99
      }, userData);
      addToResults('✓ ProductView event sent (both client and server-side)');
    } catch (error) {
      addToResults(`✗ ProductView failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testAddToCart = async () => {
    setIsLoading(true);
    try {
      const userData: MetaPixelUserData = {
        email: 'test@example.com'
      };
      
      await pixelYourSiteService.trackAddToCart({
        product_id: 'test_product_1',
        product_name: 'Test Product',
        product_price: 29.99,
        currency: 'USD',
        value: 29.99,
        quantity: 1
      }, userData);
      addToResults('✓ AddToCart event sent (both client and server-side)');
    } catch (error) {
      addToResults(`✗ AddToCart failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testPurchase = async () => {
    setIsLoading(true);
    try {
      const userData: MetaPixelUserData = {
        email: 'test@example.com'
      };
      
      await pixelYourSiteService.trackPurchase({
        value: 29.99,
        currency: 'USD',
        contents: [{
          id: 'test_product_1',
          quantity: 1,
          item_price: 29.99
        }],
        order_id: 'test_order_123'
      }, userData);
      addToResults('✓ Purchase event sent (both client and server-side)');
    } catch (error) {
      addToResults(`✗ Purchase failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testCustomEvent = async () => {
    setIsLoading(true);
    try {
      const userData: MetaPixelUserData = {
        email: 'test@example.com'
      };
      
      await pixelYourSiteService.trackCustomEvent('TestEvent', {
        custom_param: 'test_value',
        value: 10.99
      }, userData);
      addToResults('✓ CustomEvent sent (both client and server-side)');
    } catch (error) {
      addToResults(`✗ CustomEvent failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Meta Pixel Tracking Test</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <button
          onClick={testPageView}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Test Page View
        </button>
        
        <button
          onClick={testProductView}
          disabled={isLoading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          Test Product View
        </button>
        
        <button
          onClick={testAddToCart}
          disabled={isLoading}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
        >
          Test Add to Cart
        </button>
        
        <button
          onClick={testPurchase}
          disabled={isLoading}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
          Test Purchase
        </button>
        
        <button
          onClick={testCustomEvent}
          disabled={isLoading}
          className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:opacity-50 col-span-2"
        >
          Test Custom Event
        </button>
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-700">Test Results:</h3>
        <button
          onClick={clearResults}
          className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
        >
          Clear Results
        </button>
      </div>
      
      <div className="h-64 overflow-y-auto border border-gray-200 rounded p-4 bg-gray-50">
        {testResults.length === 0 ? (
          <p className="text-gray-500 italic">Click a test button above to send tracking events...</p>
        ) : (
          <ul className="space-y-1">
            {testResults.map((result, index) => (
              <li key={index} className="text-sm font-mono p-1 bg-white rounded border-b border-gray-100">
                {result}
              </li>
            ))}
          </ul>
        )}
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 rounded border border-blue-200">
        <h4 className="font-semibold text-blue-800 mb-2">How to Verify Tracking:</h4>
        <ul className="list-disc pl-5 space-y-1 text-sm text-blue-700">
          <li>Check browser Network tab for client-side events (look for Facebook Pixel requests)</li>
          <li>Check WordPress error logs for server-side events</li>
          <li>Monitor Meta Events Manager for events (server-side events will be marked as such)</li>
          <li>Use Facebook Pixel Helper browser extension for verification</li>
        </ul>
      </div>
    </div>
  );
};

export default MetaPixelTestComponent;
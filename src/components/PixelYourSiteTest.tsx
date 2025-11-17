// components/PixelYourSiteTest.tsx
// Test component to verify PixelYourSite integration is working

import React, { useEffect } from 'react';
import { pixelYourSiteService } from '../services/pixelYourSiteService';

const PixelYourSiteTest: React.FC = () => {
  useEffect(() => {
    // Track page view on component mount
    pixelYourSiteService.trackPageView('PixelYourSite Test Page', window.location.href);
  }, []);

  const handleTestProductView = () => {
    pixelYourSiteService.trackProductView({
      product_id: 'test_product_123',
      product_name: 'Test Product',
      product_price: 29.99,
      currency: 'USD',
      value: 29.99,
    });
    console.log('Product view tracked');
  };

  const handleTestAddToCart = () => {
    pixelYourSiteService.trackAddToCart({
      product_id: 'test_product_123',
      product_name: 'Test Product',
      product_price: 29.99,
      currency: 'USD',
      quantity: 1,
      value: 29.99,
    });
    console.log('Add to cart tracked');
  };

  const handleTestCheckout = () => {
    pixelYourSiteService.trackCheckoutStart({
      value: 29.99,
      currency: 'USD',
      contents: [{
        id: 'test_product_123',
        quantity: 1,
        item_price: 29.99,
      }],
    });
    console.log('Checkout start tracked');
  };

  const handleTestPurchase = () => {
    pixelYourSiteService.trackPurchase({
      value: 29.99,
      currency: 'USD',
      contents: [{
        id: 'test_product_123',
        quantity: 1,
        item_price: 29.99,
      }],
      order_id: 'test_order_456',
    });
    console.log('Purchase tracked');
  };

  const handleTestSearch = () => {
    pixelYourSiteService.trackSearch('test product');
    console.log('Search tracked');
  };

  const handleTestCustomEvent = () => {
    pixelYourSiteService.trackCustomEvent('test_event', {
      custom_param: 'test_value',
      product_id: 'test_product_123',
    });
    console.log('Custom event tracked');
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">PixelYourSite Test Component</h2>
      <p className="mb-4">This component tests the PixelYourSite integration.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={handleTestProductView}
        >
          Track Product View
        </button>
        
        <button
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          onClick={handleTestAddToCart}
        >
          Track Add to Cart
        </button>
        
        <button
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          onClick={handleTestCheckout}
        >
          Track Checkout Start
        </button>
        
        <button
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          onClick={handleTestPurchase}
        >
          Track Purchase
        </button>
        
        <button
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          onClick={handleTestSearch}
        >
          Track Search
        </button>
        
        <button
          className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
          onClick={handleTestCustomEvent}
        >
          Track Custom Event
        </button>
      </div>
      
      <div className="mt-6 p-4 bg-gray-100 rounded">
        <h3 className="font-bold mb-2">PixelYourSite Status:</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Google Analytics: {pixelYourSiteService.isProviderActive('Google Analytics') ? 'Active' : 'Inactive'}</li>
          <li>Meta Pixel: {pixelYourSiteService.isProviderActive('Meta Pixel') ? 'Active' : 'Inactive'}</li>
          <li>TikTok Pixel: {pixelYourSiteService.isProviderActive('TikTok Pixel') ? 'Active' : 'Inactive'}</li>
        </ul>
      </div>
    </div>
  );
};

export default PixelYourSiteTest;
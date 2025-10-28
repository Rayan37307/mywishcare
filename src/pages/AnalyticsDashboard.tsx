// pages/AnalyticsDashboard.tsx
// Analytics dashboard to view tracking data

import React, { useState, useEffect } from 'react';
import { productTrackingService } from '../services/productTrackingService';
import { checkoutTrackingService } from '../services/checkoutTrackingService';
import { fakeOrderBlockingService } from '../services/fakeOrderBlockingService';
import { pixelConfirmationService } from '../services/pixelConfirmationService';

const AnalyticsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Get stats from all services
  const overviewStats = {
    totalProducts: productTrackingService.getTrackedProducts().length,
    mostViewedProducts: productTrackingService.getMostViewedProducts(5),
    totalAbandonedCheckouts: checkoutTrackingService.getAbandonedCheckouts().length,
    abandonmentStats: checkoutTrackingService.getAbandonmentStats(),
    fraudStats: fakeOrderBlockingService.getStatistics(),
    verificationStats: pixelConfirmationService.getVerificationStats(),
  };
  
  // Force refresh of stats
  const handleRefresh = () => {
    // Currently does nothing since we're using direct service calls
  };
  
  // Clean up old data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      productTrackingService.clearOldData();
      fakeOrderBlockingService.cleanupExpiredBlocks();
      pixelConfirmationService.clearOldData();
    }, 60 * 60 * 1000); // Every hour
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="bg-white py-10">
      <div className="container mx-auto max-w-7xl p-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <button 
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh Data
          </button>
        </div>
        
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'products', label: 'Product Tracking' },
              { id: 'checkouts', label: 'Checkout Analysis' },
              { id: 'fraud', label: 'Fraud Protection' },
              { id: 'pixels', label: 'Pixel Verification' },
            ].map((tab) => (
              <button
                key={tab.id}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        
        {/* Tab Content */}
        <div className="mt-4">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900">Tracked Products</h3>
                <p className="mt-2 text-3xl font-semibold text-gray-900">
                  {overviewStats.totalProducts}
                </p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900">Abandoned Checkouts</h3>
                <p className="mt-2 text-3xl font-semibold text-gray-900">
                  {overviewStats.totalAbandonedCheckouts}
                </p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900">Suspicious Orders</h3>
                <p className="mt-2 text-3xl font-semibold text-gray-900">
                  {overviewStats.fraudStats.suspiciousOrders}
                </p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900">Pixel Confirmations</h3>
                <p className="mt-2 text-3xl font-semibold text-gray-900">
                  {overviewStats.verificationStats.confirmedOrders} / {overviewStats.verificationStats.totalOrders}
                </p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg col-span-2">
                <h3 className="text-lg font-medium text-gray-900">Checkout Abandonment Rate</h3>
                <p className="mt-2 text-2xl font-semibold text-gray-900">
                  {overviewStats.abandonmentStats.totalAbandoned > 0 ? 
                    Math.round(
                      (overviewStats.abandonmentStats.totalAbandoned / 
                      (overviewStats.abandonmentStats.totalAbandoned + 10)) * 100 // +10 is placeholder for completed
                    ) + '%' : '0%'}
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  Identified top abandonment points: {overviewStats.abandonmentStats.topAbandonmentPoints.join(', ')}
                </p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg col-span-2">
                <h3 className="text-lg font-medium text-gray-900">Fraud Protection Stats</h3>
                <p className="mt-2 text-2xl font-semibold text-gray-900">
                  {Math.round(overviewStats.fraudStats.fakeOrderRate * 100) || 0}%
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  {overviewStats.fraudStats.blockedIPs} blocked IPs
                </p>
              </div>
            </div>
          )}
          
          {/* Product Tracking Tab */}
          {activeTab === 'products' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Product Tracking</h2>
              
              <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Most Viewed Products</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Viewed</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {overviewStats.mostViewedProducts.map((product, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{product.price}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(product.timestamp).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          
          {/* Checkout Analysis Tab */}
          {activeTab === 'checkouts' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Checkout Analysis</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Abandonment Statistics</h3>
                  <ul className="space-y-2">
                    <li className="flex justify-between">
                      <span>Total Abandoned Checkouts:</span>
                      <span className="font-medium">{overviewStats.totalAbandonedCheckouts}</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Abandonment Rate:</span>
                      <span className="font-medium">
                        {overviewStats.abandonmentStats.totalAbandoned > 0 ? 
                          Math.round(
                            (overviewStats.abandonmentStats.totalAbandoned / 
                            (overviewStats.abandonmentStats.totalAbandoned + 10)) * 100 // +10 is placeholder
                          ) + '%' : '0%'}
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span>Top Abandonment Points:</span>
                      <span className="font-medium">{overviewStats.abandonmentStats.topAbandonmentPoints.join(', ')}</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Abandoned Checkouts</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {checkoutTrackingService.getAbandonedCheckouts()
                          .slice(0, 5)
                          .map((checkout, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {checkout.formData.email}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                ₹{checkout.value.toFixed(2)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(checkout.timestamp).toLocaleTimeString()}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Fraud Protection Tab */}
          {activeTab === 'fraud' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Fraud Protection</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900">Orders Processed</h3>
                  <p className="mt-2 text-3xl font-semibold text-gray-900">
                    {overviewStats.fraudStats.totalOrdersProcessed}
                  </p>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900">Suspicious Orders</h3>
                  <p className="mt-2 text-3xl font-semibold text-gray-900">
                    {overviewStats.fraudStats.suspiciousOrders}
                  </p>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900">Blocked IPs</h3>
                  <p className="mt-2 text-3xl font-semibold text-gray-900">
                    {overviewStats.fraudStats.blockedIPs}
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Blocked IPs</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blocked Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {fakeOrderBlockingService.getBlockedIPs()
                        .slice(0, 10)
                        .map((rule, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{rule.ip}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rule.reason}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(rule.timestamp).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          
          {/* Pixel Verification Tab */}
          {activeTab === 'pixels' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Pixel Verification</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900">Total Orders</h3>
                  <p className="mt-2 text-3xl font-semibold text-gray-900">
                    {overviewStats.verificationStats.totalOrders}
                  </p>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900">Verified by Pixel</h3>
                  <p className="mt-2 text-3xl font-semibold text-gray-900">
                    {overviewStats.verificationStats.confirmedOrders}
                  </p>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900">Verification Rate</h3>
                  <p className="mt-2 text-3xl font-semibold text-gray-900">
                    {Math.round(overviewStats.verificationStats.confirmationRate * 100) || 0}%
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Pixel Confirmations</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confirmed By</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {pixelConfirmationService.getConfirmedOrders()
                        .slice(0, 5)
                        .map((result, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {result.orderId}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${result.confirmedByPixel ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {result.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {result.pixelProviders.join(', ')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(result.timestamp).toLocaleTimeString()}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
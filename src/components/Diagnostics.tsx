// src/components/Diagnostics.tsx
import React, { useState, useEffect } from 'react';
import { checkRequiredPlugins } from '../utils/wordpressChecker';

const Diagnostics: React.FC = () => {
  const [pluginStatus, setPluginStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const checkPlugins = async () => {
    setLoading(true);
    setError('');
    
    try {
      const status = await checkRequiredPlugins();
      setPluginStatus(status);
    } catch (err) {
      setError(`Error checking plugins: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkPlugins();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">WordPress Plugin Diagnostics</h1>
      
      <button 
        onClick={checkPlugins}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded mb-4 disabled:bg-gray-400"
      >
        {loading ? 'Checking...' : 'Check Plugin Status'}
      </button>
      
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {pluginStatus && (
        <div className="space-y-4">
          <div className={`p-4 rounded ${pluginStatus.allPluginsActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            <h2 className="text-xl font-semibold mb-2">
              {pluginStatus.allPluginsActive ? '✅ All Plugins Active' : '❌ Missing Plugins Detected'}
            </h2>
            
            {!pluginStatus.allPluginsActive && (
              <div>
                <p className="mb-2">The following plugins are missing or not properly configured:</p>
                <ul className="list-disc pl-6">
                  {pluginStatus.missingPlugins.map((plugin: string) => (
                    <li key={plugin}>{plugin}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded ${pluginStatus.pluginStatus.wordpress ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              <h3 className="font-semibold mb-2">WordPress REST API</h3>
              <p>Status: {pluginStatus.pluginStatus.wordpress ? '✅ Active' : '❌ Inactive'}</p>
            </div>
            
            <div className={`p-4 rounded ${pluginStatus.pluginStatus.woocommerce ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              <h3 className="font-semibold mb-2">WooCommerce</h3>
              <p>Status: {pluginStatus.pluginStatus.woocommerce ? '✅ Active' : '❌ Inactive'}</p>
            </div>
            
            <div className={`p-4 rounded ${pluginStatus.pluginStatus.jwtAuth ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              <h3 className="font-semibold mb-2">JWT Authentication</h3>
              <p>Status: {pluginStatus.pluginStatus.jwtAuth ? '✅ Active' : '❌ Inactive'}</p>
            </div>
          </div>
          
          {pluginStatus.pluginStatus.apiInfo && (
            <div className="p-4 bg-gray-100 rounded">
              <h3 className="font-semibold mb-2">API Information</h3>
              <pre className="text-xs overflow-auto max-h-96 bg-white p-2 rounded">
                {JSON.stringify(pluginStatus.pluginStatus.apiInfo, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Diagnostics;
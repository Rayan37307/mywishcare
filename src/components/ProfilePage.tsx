import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useOrder } from '../contexts/OrderContext';
import { useCartStore } from '../store/cartStore';

const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { orders, loading: ordersLoading, error: ordersError, fetchOrders, fetchOrder } = useOrder();
  const { items: cartItems, totalPrice: cartTotal } = useCartStore();
  const [activeTab, setActiveTab] = useState<'orders' | 'cart'>('orders'); // Removed profile tab, only orders and cart
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  
  // Check for hash in URL to determine active tab
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#orders' || hash === '#profile') { // Still handle #profile for backward compatibility
        setActiveTab('orders');
      } else if (hash === '#cart') {
        setActiveTab('cart');
      }
    };

    // Check on initial load
    handleHashChange();
    
    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    
    // Cleanup
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Fetch orders when the component mounts and user is authenticated
      fetchOrders();
    }
  }, [isAuthenticated, user]); // Removed fetchOrders from dependencies to prevent infinite loop

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Access Denied
            </h2>
            <p className="mt-2 text-gray-600">
              Please log in to view your profile.
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  // Additional safety checks
  if (!user.displayName && !user.username) {
    console.error('User object missing required fields:', user);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Profile Error</h2>
          <p className="text-gray-600">User data is incomplete. Please try logging out and in again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          {/* Profile Header */}
          <div className="px-6 py-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-14 w-14 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                  <span className="text-xl font-bold">
                    {user.displayName?.charAt(0)?.toUpperCase() || user.username?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="ml-4">
                  <h1 className="text-xl leading-6 font-bold text-gray-900">
                    {user.displayName || user.username}
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    {user.email || 'No email'}
                  </p>
                </div>
              </div>
              <button
                onClick={logout}
                className="text-sm bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg transition-colors duration-200 font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-4 -mb-px">
              <button
                onClick={() => setActiveTab('orders')}
                className={`${
                  activeTab === 'orders'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Orders ({orders.length})
              </button>
              <button
                onClick={() => setActiveTab('cart')}
                className={`${
                  activeTab === 'cart'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Cart ({cartItems.length})
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">


            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">Order History</h2>
                    <p className="mt-1 text-sm text-gray-500">
                      View your past orders and their status.
                    </p>
                  </div>
                  <button
                    onClick={fetchOrders} // Use the fetchOrders function to manually refresh
                    disabled={ordersLoading}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {ordersLoading ? 'Refreshing...' : 'Refresh Orders'}
                  </button>
                </div>

                {ordersLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                  </div>
                ) : ordersError ? (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{ordersError}</span>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No orders found.</p>
                    <p className="text-sm text-gray-500 mt-2">Your orders will appear here after you place them.</p>
                  </div>
                ) : (
                  <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                      {orders.map((order) => (
                        <li key={order.id}>
                          <div 
                            className="px-4 py-4 sm:px-6 hover:bg-gray-50 cursor-pointer"
                            onClick={async () => {
                              try {
                                // Try to fetch the full order details
                                await fetchOrder(order.id);
                                setSelectedOrder(order);
                                setShowOrderModal(true);
                              } catch (error) {
                                console.error('Error fetching order details:', error);
                                // If fetchOrder fails, just show the partial order data we already have
                                setSelectedOrder(order);
                                setShowOrderModal(true);
                              }
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="text-sm font-medium text-indigo-600 truncate">
                                Order #{order.id}
                              </div>
                              <div className="ml-2 flex-shrink-0 flex">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                                  order.status === 'on-hold' ? 'bg-orange-100 text-orange-800' :
                                  order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                  order.status === 'refunded' ? 'bg-purple-100 text-purple-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {order.status.replace('-', ' ').toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="mt-2 sm:flex sm:justify-between">
                              <div className="sm:flex">
                                <div className="mr-6 text-sm text-gray-500">
                                  {new Date(order.date_created).toLocaleDateString()}
                                </div>
                                <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                  Items: {order.line_items.reduce((sum, item) => sum + item.quantity, 0)}
                                </div>
                              </div>
                              <div className="mt-2 flex items-center text-sm text-gray-900 font-medium sm:mt-0">
                                {order.total} {order.currency}
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Cart Tab */}
            {activeTab === 'cart' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Shopping Cart</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    View and manage your cart items.
                  </p>
                </div>

                {cartItems.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Your cart is empty.</p>
                  </div>
                ) : (
                  <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                      {cartItems.map((item) => (
                        <li key={item.product.id}>
                          <div className="px-4 py-4 sm:px-6">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-16 w-16">
                                <img
                                  className="h-16 w-16 rounded-md object-cover"
                                  src={item.product.images?.[0]?.src || '/placeholder-image.jpg'}
                                  alt={item.product.images?.[0]?.alt || item.product.name}
                                />
                              </div>
                              <div className="ml-4 flex-1">
                                <div className="flex items-center justify-between">
                                  <div className="text-sm font-medium text-gray-900 truncate">
                                    {item.product.name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    Qty: {item.quantity}
                                  </div>
                                </div>
                                <div className="mt-1 text-sm text-gray-500">
                                  ${parseFloat(String(item.product.price || '0')).toFixed(2)} each
                                </div>
                              </div>
                              <div className="ml-4 text-sm font-medium text-gray-900">
                                ${(parseFloat(String(item.product.price || '0')) * item.quantity).toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                    
                    <div className="bg-gray-50 px-4 py-4 sm:px-6 flex justify-between items-center">
                      <div className="text-lg font-medium text-gray-900">
                        Total: ${cartTotal.toFixed(2)}
                      </div>
                      <button 
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        onClick={() => window.location.hash = '#/checkout'}
                      >
                        Checkout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Order Detail Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-medium text-gray-900">Order Details</h3>
                <button 
                  onClick={() => setShowOrderModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>
              
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Order ID</p>
                    <p className="font-medium">#{selectedOrder.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-medium">{new Date(selectedOrder.date_created).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className={`font-medium ${
                      selectedOrder.status === 'completed' ? 'text-green-600' :
                      selectedOrder.status === 'processing' ? 'text-yellow-600' :
                      selectedOrder.status === 'on-hold' ? 'text-orange-600' :
                      selectedOrder.status === 'cancelled' ? 'text-red-600' :
                      selectedOrder.status === 'refunded' ? 'text-purple-600' :
                      'text-gray-600'
                    }`}>
                      {selectedOrder.status.replace('-', ' ').toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="font-medium">{selectedOrder.total} {selectedOrder.currency}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-md font-medium mt-4">Items</h4>
                  <ul className="mt-2 space-y-2">
                    {selectedOrder.line_items?.map((item: any, index: number) => (
                      <li key={index} className="flex justify-between text-sm">
                        <span>{item.name} (Qty: {item.quantity})</span>
                        <span>{item.total}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div>
                    <h4 className="text-md font-medium">Billing Address</h4>
                    <p className="text-sm mt-1">
                      {selectedOrder.billing?.first_name} {selectedOrder.billing?.last_name}<br />
                      {selectedOrder.billing?.address_1}<br />
                      {selectedOrder.billing?.address_2 && (
                        <>
                          {selectedOrder.billing.address_2}<br />
                        </>
                      )}
                      {selectedOrder.billing?.city}, {selectedOrder.billing?.state} {selectedOrder.billing?.postcode}<br />
                      {selectedOrder.billing?.country}<br />
                      {selectedOrder.billing?.email}<br />
                      {selectedOrder.billing?.phone}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-md font-medium">Shipping Address</h4>
                    <p className="text-sm mt-1">
                      {selectedOrder.shipping?.first_name} {selectedOrder.shipping?.last_name}<br />
                      {selectedOrder.shipping?.address_1}<br />
                      {selectedOrder.shipping?.address_2 && (
                        <>
                          {selectedOrder.shipping.address_2}<br />
                        </>
                      )}
                      {selectedOrder.shipping?.city}, {selectedOrder.shipping?.state} {selectedOrder.shipping?.postcode}<br />
                      {selectedOrder.shipping?.country}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
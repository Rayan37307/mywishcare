import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useOrder } from '../contexts/OrderContext';

interface CartItem {
  product: {
    id: number;
    name: string;
    price: string;
    images: Array<{ src: string; alt: string }>;
  };
  quantity: number;
}

const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, logout, updateUser } = useAuth();
  const { orders, loading: ordersLoading, error: ordersError, fetchOrders } = useOrder();
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'cart'>('profile');
  
  // Check for hash in URL to determine active tab
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#orders') {
        setActiveTab('orders');
      } else if (hash === '#cart') {
        setActiveTab('cart');
      } else if (hash === '#profile') {
        setActiveTab('profile');
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
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [editData, setEditData] = useState({
    displayName: '',
    email: '',
    username: '',
  });

  // Update editData when user changes
  useEffect(() => {
    if (user) {
      setEditData({
        displayName: user.displayName || '',
        email: user.email || '',
        username: user.username || '',
      });
    }
  }, [user]);

  // Cart data from localStorage
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Load cart items from localStorage
  useEffect(() => {
    console.log('useEffect running with isAuthenticated:', isAuthenticated, 'user:', user); // Debug log
    
    if (!isAuthenticated || !user) {
      console.log('User not authenticated or user is null, returning');
      return;
    }

    try {
      const cartData = localStorage.getItem('cart-storage');
      console.log('Raw cart data from localStorage:', cartData); // Debug log
      
      if (cartData && cartData !== 'undefined') {
        try {
          const parsedData = JSON.parse(cartData);
          console.log('Parsed cart data:', parsedData); // Debug log
          
          if (parsedData && parsedData.state && parsedData.state.items) {
            setCartItems(parsedData.state.items);
            console.log('Set cart items:', parsedData.state.items); // Debug log
          } else {
            console.log('Cart data structure issue - no state or items found'); // Debug log
            setCartItems([]);
          }
        } catch (parseError) {
          console.error('Error parsing cart data:', parseError);
          setCartItems([]);
        }
      } else {
        console.log('No cart data found in localStorage or data is undefined'); // Debug log
        setCartItems([]);
      }
    } catch (error) {
      console.error('Error in useEffect:', error);
    }
  }, [isAuthenticated, user]);

  // Separate effect to handle cart item count display
  useEffect(() => {
    console.log('Cart items state updated:', cartItems); // Debug log
  }, [cartItems]);

  // Handle profile update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const result = await updateUser({
        displayName: editData.displayName,
        email: editData.email,
        username: editData.username,
      });

      if (result.success) {
        setMessage('Profile updated successfully!');
      } else {
        setMessage(result.error || 'Failed to update profile');
      }
    } catch (error) {
      setMessage('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  // Calculate cart total
  const cartTotal = React.useMemo(() => {
    return cartItems.reduce((total, item) => {
      // Safely parse the price
      let price = 0;
      if (typeof item.product.price === 'string') {
        price = parseFloat(item.product.price) || 0;
      } else if (typeof item.product.price === 'number') {
        price = item.product.price;
      }
      return total + (price * (item.quantity || 0));
    }, 0);
  }, [cartItems]);

  if (!isAuthenticated || !user) {
    console.log('User not authenticated or user data is null'); // Debug log
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

  console.log('User is authenticated, rendering profile page'); // Debug log
  console.log('Current user:', user); // Debug log
  console.log('Current cart items:', cartItems); // Debug log
  console.log('Current orders:', orders); // Debug log
  
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
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-12 w-12 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                <span className="text-lg font-medium">
                  {user.displayName?.charAt(0)?.toUpperCase() || user.username?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="ml-4">
                <h1 className="text-lg leading-6 font-medium text-gray-900">
                  {user.displayName || user.username}
                </h1>
                <p className="text-sm text-gray-500">
                  {user.email || 'No email'}
                </p>
              </div>
              <button
                onClick={logout}
                className="ml-auto text-sm text-red-600 hover:text-red-800"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-4 -mb-px">
              <button
                onClick={() => setActiveTab('profile')}
                className={`${
                  activeTab === 'profile'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Profile
              </button>
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
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Personal Information</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Update your personal details here.
                  </p>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  {message && (
                    <div className={`px-4 py-3 rounded ${message.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {message}
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
                        Display Name
                      </label>
                      <input
                        type="text"
                        id="displayName"
                        value={editData.displayName}
                        onChange={(e) => setEditData({...editData, displayName: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                        Username
                      </label>
                      <input
                        type="text"
                        id="username"
                        value={editData.username}
                        onChange={(e) => setEditData({...editData, username: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div className="sm:col-span-6">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={editData.email}
                        onChange={(e) => setEditData({...editData, email: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Order History</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    View your past orders and their status.
                  </p>
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
                  </div>
                ) : (
                  <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                      {orders.map((order) => (
                        <li key={order.id}>
                          <div 
                            className="px-4 py-4 sm:px-6 hover:bg-gray-50 cursor-pointer"
                            onClick={() => console.log('View order details', order.id)}
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
                      {cartItems.map((item, index) => (
                        <li key={index}>
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
                                  ${typeof item.product.price === 'number' ? item.product.price.toFixed(2) : item.product.price || '0.00'} each
                                </div>
                              </div>
                              <div className="ml-4 text-sm font-medium text-gray-900">
                                ${((typeof item.product.price === 'number' ? item.product.price : parseFloat(item.product.price || '0')) * (item.quantity || 0)).toFixed(2)}
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
                      <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
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
    </div>
  );
};

export default ProfilePage;
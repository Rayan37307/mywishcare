import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const OrderSuccessPage: React.FC = () => {
  const location = useLocation();
  const { order, total } = location.state || { order: null, total: 0 };

  // Format the order date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 rounded-full p-4">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h1>
          
          <p className="text-gray-600 mb-8 text-lg">
            Thank you for your order. Your order has been received and is being processed.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
            <h2 className="font-bold text-lg mb-4">Order Details</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Order Number:</span> #{order?.id || 'WISH001'}</p>
              <p><span className="font-medium">Order Date:</span> {order?.date_created ? formatDate(order.date_created) : new Date().toLocaleDateString()}</p>
              <p><span className="font-medium">Total Amount:</span> ৳{order?.total || total?.toFixed(2) || '0.00'}</p>
              <p><span className="font-medium">Payment Method:</span> {order?.payment_method_title || 'Cash on Delivery'}</p>
              <p><span className="font-medium">Status:</span> <span className={`px-2 py-1 rounded text-sm ${
                order?.status === 'completed' ? 'bg-green-100 text-green-800' :
                order?.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {order?.status?.charAt(0).toUpperCase() + order?.status?.slice(1) || 'Pending'}
              </span></p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Link 
              to="/" 
              className="px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-colors font-medium"
            >
              Continue Shopping
            </Link>
            {/* <Link 
              to="/orders" 
              className="px-6 py-3 bg-gray-200 text-black rounded-md hover:bg-gray-300 transition-colors font-medium"
            >
              View Order History
            </Link> */}
          </div>
          
          <div className="text-sm text-gray-500">
            <p>You will receive an email confirmation shortly with order details and tracking information.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
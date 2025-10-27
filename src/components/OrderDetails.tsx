import React from 'react';
import type { Order } from '../services/woocommerceService';

interface OrderDetailsProps {
  order: Order;
  onBack: () => void;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ order, onBack }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'processing':
        return 'text-blue-600 bg-blue-100';
      case 'on-hold':
        return 'text-yellow-600 bg-yellow-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      case 'refunded':
        return 'text-purple-600 bg-purple-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <button
        onClick={onBack}
        className="mb-6 flex items-center text-blue-600 hover:text-blue-800"
      >
        <span className="mr-2">←</span> Back to Orders
      </button>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">Order # {order.id}</h1>
              <p className="text-gray-600">Placed on {formatDate(order.date_created)}</p>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              {order.status.replace('-', ' ').toUpperCase()}
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Order Items */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.line_items.map((item) => (
                <div key={item.id} className="flex justify-between items-start border-b pb-3">
                  <div>
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-gray-600 text-sm">Qty: {item.quantity}</p>
                    {item.sku && <p className="text-gray-500 text-xs">SKU: {item.sku}</p>}
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{(item.price * item.quantity).toFixed(2)} {order.currency}</p>
                    <p className="text-gray-600 text-sm">{item.price.toFixed(2)} × {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{order.total} {order.currency}</span>
              </div>
              {order.shipping_lines.map((shipping) => (
                <div key={shipping.id} className="flex justify-between">
                  <span>Shipping ({shipping.method_title})</span>
                  <span>{shipping.total} {order.currency}</span>
                </div>
              ))}
              <div className="border-t pt-2 mt-2 font-semibold flex justify-between">
                <span>Total</span>
                <span>{order.total} {order.currency}</span>
              </div>
            </div>

            <h2 className="text-xl font-semibold mb-4 mt-6">Customer Information</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-700">Billing Address</h3>
                <p>{order.billing.first_name} {order.billing.last_name}</p>
                <p>{order.billing.address_1}</p>
                {order.billing.address_2 && <p>{order.billing.address_2}</p>}
                <p>{order.billing.city}, {order.billing.state} {order.billing.postcode}</p>
                <p>{order.billing.country}</p>
                <p className="mt-2">Email: {order.billing.email}</p>
                <p>Phone: {order.billing.phone}</p>
              </div>

              <div>
                <h3 className="font-medium text-gray-700">Shipping Address</h3>
                <p>{order.shipping.first_name} {order.shipping.last_name}</p>
                <p>{order.shipping.address_1}</p>
                {order.shipping.address_2 && <p>{order.shipping.address_2}</p>}
                <p>{order.shipping.city}, {order.shipping.state} {order.shipping.postcode}</p>
                <p>{order.shipping.country}</p>
              </div>

              <div>
                <h3 className="font-medium text-gray-700">Payment Method</h3>
                <p>{order.payment_method_title}</p>
              </div>

              {order.customer_note && (
                <div>
                  <h3 className="font-medium text-gray-700">Customer Note</h3>
                  <p>{order.customer_note}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
import React from 'react';
import type { Order } from '../services/woocommerceService';

interface OrderItemProps {
  order: Order;
  onClick?: () => void;
}

const OrderItem: React.FC<OrderItemProps> = ({ order, onClick }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
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
    <div 
      className="border border-gray-200 rounded-lg p-4 mb-3 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg"># {order.id}</h3>
          <p className="text-gray-600 text-sm">{formatDate(order.date_created)}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
          {order.status.replace('-', ' ').toUpperCase()}
        </div>
      </div>
      
      <div className="mt-3">
        <p className="font-medium">{order.total} {order.currency}</p>
        <p className="text-gray-600 text-sm mt-1">
          {order.line_items.length} item{order.line_items.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
};

export default OrderItem;
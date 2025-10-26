import React, { useState } from 'react';
import { useOrder } from '../contexts/OrderContext';
import OrderItem from './OrderItem';
import OrderDetails from './OrderDetails';

const OrdersPage: React.FC = () => {
  const { 
    orders, 
    loading, 
    error, 
    selectedOrder, 
    fetchOrders, 
    fetchOrder 
  } = useOrder();
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const handleOrderClick = async (order: any) => {
    setSelectedOrderId(order.id);
    await fetchOrder(order.id);
  };

  const handleBackToList = () => {
    setSelectedOrderId(null);
  };

  if (loading && !orders.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <button 
            onClick={() => fetchOrders()}
            className="ml-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>
      
      {selectedOrderId && selectedOrder ? (
        <OrderDetails order={selectedOrder} onBack={handleBackToList} />
      ) : (
        <div>
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-xl font-medium text-gray-700 mb-2">You haven't placed any orders yet</h2>
              <p className="text-gray-500">When you place an order, it will appear here</p>
            </div>
          ) : (
            <div>
              <div className="mb-4 flex justify-between items-center">
                <p className="text-gray-600">
                  Showing {orders.length} order{orders.length !== 1 ? 's' : ''}
                </p>
                <button 
                  onClick={() => fetchOrders()}
                  className="flex items-center text-blue-600 hover:text-blue-800"
                >
                  <span className="mr-2">↺</span> Refresh
                </button>
              </div>
              <div className="space-y-2">
                {orders.map((order) => (
                  <OrderItem 
                    key={order.id} 
                    order={order} 
                    onClick={() => handleOrderClick(order)} 
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
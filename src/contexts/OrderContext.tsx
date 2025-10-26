import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { woocommerceService } from '../services/woocommerceService';
import type { Order } from '../services/woocommerceService';

interface OrderState {
  orders: Order[];
  loading: boolean;
  error: string | null;
  selectedOrder: Order | null;
}

interface OrderContextType extends OrderState {
  fetchOrders: () => Promise<void>;
  fetchOrder: (orderId: number) => Promise<void>;
  refreshOrders: () => Promise<void>;
}

const initialState: OrderState = {
  orders: [],
  loading: false,
  error: null,
  selectedOrder: null,
};

type OrderAction =
  | { type: 'FETCH_ORDERS_START' }
  | { type: 'FETCH_ORDERS_SUCCESS'; payload: Order[] }
  | { type: 'FETCH_ORDERS_ERROR'; payload: string }
  | { type: 'FETCH_ORDER_SUCCESS'; payload: Order }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'CLEAR_ERROR' };

const orderReducer = (state: OrderState, action: OrderAction): OrderState => {
  switch (action.type) {
    case 'FETCH_ORDERS_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'FETCH_ORDERS_SUCCESS':
      return {
        ...state,
        loading: false,
        orders: action.payload,
        error: null,
      };
    case 'FETCH_ORDERS_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case 'FETCH_ORDER_SUCCESS':
      return {
        ...state,
        loading: false,
        selectedOrder: action.payload,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

const OrderContext = createContext<OrderContextType | undefined>(undefined);

interface OrderProviderProps {
  children: React.ReactNode;
}

export const OrderProvider: React.FC<OrderProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(orderReducer, initialState);

  const fetchOrders = async () => {
    try {
      dispatch({ type: 'FETCH_ORDERS_START' });
      
      // Get customer ID from JWT token or user context
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        throw new Error('User not authenticated');
      }

      // In a real implementation, you'd decode the JWT to get the user ID
      // For now, we'll assume the user ID is stored or retrieved differently
      // This is a placeholder - you'll need to adjust based on your user system
      const userData = localStorage.getItem('user_data');
      let customerId = 0;
      
      if (userData) {
        const user = JSON.parse(userData);
        customerId = user.id || 0;
      }

      if (!customerId) {
        throw new Error('Customer ID not found');
      }

      const orders = await woocommerceService.getCustomerOrders(customerId);
      dispatch({ type: 'FETCH_ORDERS_SUCCESS', payload: orders });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch orders';
      dispatch({ type: 'FETCH_ORDERS_ERROR', payload: errorMessage });
    }
  };

  const fetchOrder = async (orderId: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const userData = localStorage.getItem('user_data');
      let customerId = 0;
      
      if (userData) {
        const user = JSON.parse(userData);
        customerId = user.id || 0;
      }

      if (!customerId) {
        throw new Error('Customer ID not found');
      }

      const order = await woocommerceService.getOrderById(orderId, customerId);
      dispatch({ type: 'FETCH_ORDER_SUCCESS', payload: order });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch order';
      dispatch({ type: 'FETCH_ORDERS_ERROR', payload: errorMessage });
    }
  };

  const refreshOrders = async () => {
    await fetchOrders();
  };

  // Fetch orders on initial load
  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      fetchOrders();
    }
  }, []);

  return (
    <OrderContext.Provider
      value={{
        ...state,
        fetchOrders,
        fetchOrder,
        refreshOrders,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = (): OrderContextType => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};
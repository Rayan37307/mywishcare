// src/store/cartStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartState, CartItem } from '../types/cart';
import type { Product } from '../types/product';
import { APP_CONSTANTS } from '../constants/app';

// Function to check if user is authenticated
const isAuthenticated = (): boolean => {
  return !!localStorage.getItem(APP_CONSTANTS.USER_STORAGE_KEY);
};

// Custom storage to conditionally persist based on auth state
const conditionalStorage = {
  getItem: (name: string) => {
    if (isAuthenticated()) {
      // Don't persist when logged in - always return empty state for logged-in users
      return { items: [] };
    }
    // For non-logged-in users, return the stored value
    const value = localStorage.getItem(name);
    if (value) {
      try {
        return JSON.parse(value);
      } catch {
        return { items: [] };
      }
    }
    return { items: [] };
  },
  setItem: (name: string, value: unknown) => {
    if (!isAuthenticated()) {
      // Only save to localStorage when not logged in
      localStorage.setItem(name, JSON.stringify(value));
    }
  },
  removeItem: (name: string) => {
    if (!isAuthenticated()) {
      // Only remove from localStorage when not logged in
      localStorage.removeItem(name);
    }
  },
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      totalPrice: 0,
      
      addItem: (product: Product, quantity: number = 1) => {
        const { items } = get();
        const existingItemIndex = items.findIndex(item => item.product.id === product.id);
        
        let updatedItems: CartItem[];
        
        if (existingItemIndex >= 0) {
          // Update quantity if item already exists
          updatedItems = [...items];
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: updatedItems[existingItemIndex].quantity + quantity
          };
        } else {
          // Add new item
          const newItem: CartItem = {
            product,
            quantity
          };
          updatedItems = [...items, newItem];
        }
        
        set({ items: updatedItems });
        get().calculateTotals();
      },
      
      removeItem: (productId: number) => {
        const { items } = get();
        const updatedItems = items.filter(item => item.product.id !== productId);
        set({ items: updatedItems });
        get().calculateTotals();
      },
      
      updateQuantity: (productId: number, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        
        const { items } = get();
        const existingItemIndex = items.findIndex(item => item.product.id === productId);
        
        if (existingItemIndex >= 0) {
          const updatedItems = [...items];
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity
          };
          set({ items: updatedItems });
          get().calculateTotals();
        }
      },
      
      clearCart: () => {
        set({ items: [] });
        get().calculateTotals();
      },
      
      getCartItems: () => get().items,
      
      // Get specific cart item by product ID
      getCartItem: (productId: number) => {
        return get().items.find(item => item.product.id === productId) || null;
      },
      
      // Check if a product is in cart
      isInCart: (productId: number) => {
        return get().items.some(item => item.product.id === productId);
      },
      
      // Get total quantity of a specific product in cart
      getProductQuantity: (productId: number) => {
        const item = get().items.find(item => item.product.id === productId);
        return item ? item.quantity : 0;
      },
      
      // Calculate totals helper function
      calculateTotals: () => {
        const { items } = get();
        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = items.reduce((sum, item) => {
          // Convert price string to number and multiply by quantity
          // Handle both string and number formats for price
          let price: number;
          if (typeof item.product.price === 'string') {
            price = parseFloat(item.product.price.replace(/[^\d.-]/g, '')) || 0;
          } else {
            price = parseFloat(String(item.product.price)) || 0;
          }
          return sum + (price * item.quantity);
        }, 0);
        
        set({ 
          totalItems,
          totalPrice: parseFloat(totalPrice.toFixed(2)) // Round to 2 decimal places
        });
      }
    }),
    {
      name: APP_CONSTANTS.CART_STORAGE_KEY, // name of the item in the storage (must be unique)
      storage: conditionalStorage, // use custom storage that checks auth state
    }
  )
);
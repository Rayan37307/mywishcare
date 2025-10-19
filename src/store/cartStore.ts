// src/store/cartStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartState, CartItem } from '../types/cart';
import type { Product } from '../types/product';

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
      name: 'cart-storage', // name of the item in the storage (must be unique)
      partialize: (state) => ({ items: state.items }), // only persist items, not computed values
    }
  )
);
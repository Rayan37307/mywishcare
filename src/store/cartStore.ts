// src/store/cartStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartState, CartItem } from '../types/cart';
import type { Product } from '../types/product';
import { APP_CONSTANTS } from '../constants/app';
import { pixelYourSiteService } from '../services/pixelYourSiteService';



// Function to get user-specific key for cart persistence
const getUserCartKey = (name: string): string => {
  const userId = localStorage.getItem(APP_CONSTANTS.USER_STORAGE_KEY);
  if (userId) {
    // For authenticated users, use a key that includes their user ID
    try {
      const userData = JSON.parse(atob(userId.split('.')[1])); // Assuming JWT format
      return `${name}_${userData.id || userData.user_id || 'default'}`;
    } catch {
      // If JWT parsing fails, use a generic authenticated user key
      return `${name}_auth`;
    }
  } else {
    // For non-authenticated users, use the default key
    return name;
  }
};

// Custom storage to handle persistence with user-specific keys
const conditionalStorage = {
  getItem: (name: string) => {
    const key = getUserCartKey(name);
    const value = localStorage.getItem(key);
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
    const key = getUserCartKey(name);
    localStorage.setItem(key, JSON.stringify(value));
  },
  removeItem: (name: string) => {
    const key = getUserCartKey(name);
    localStorage.removeItem(key);
  },
};

// Global function to open the cart - will be set by App component
let globalOpenCartFunction: (() => void) | null = null;

export const setGlobalOpenCartFunction = (openCartFunc: () => void) => {
  globalOpenCartFunction = openCartFunc;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      totalPrice: 0,
      loadingItems: [], // Track which products are currently being added

      addItem: (product: Product, quantity: number = 1) => {
        // Check stock status before adding to cart
        if (product.stock_status === 'outofstock') {
          return;
        }

        // For managed stock, check if there's enough quantity available
        if (product.manage_stock && product.stock_quantity !== null) {
          const currentCartQuantity = get().getProductQuantity(product.id);
          const totalRequested = currentCartQuantity + quantity;

          if (totalRequested > product.stock_quantity) {
            return;
          }
        }

        set(state => ({
          loadingItems: [...state.loadingItems, product.id]
        }));

        // Directly update the cart state without complex timing
        const { items, loadingItems } = get();
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

        // Track add to cart event with PixelYourSite
        pixelYourSiteService.trackAddToCart({
          product_id: product.id,
          product_name: product.name,
          product_price: parseFloat(product.price.replace(/[^\d.-]/g, '')),
          currency: 'BDT',
          quantity: quantity,
          value: parseFloat(product.price.replace(/[^\d.-]/g, '')) * quantity,
        });

        // Update state and remove from loading state in a single batch
        set({
          items: updatedItems,
          loadingItems: loadingItems.filter(id => id !== product.id)
        });
        get().calculateTotals();

        // Use global function to open the cart if available
        if (globalOpenCartFunction) {
          globalOpenCartFunction();
        }

        // Dispatch a custom event as backup to notify that an item was added to cart
        window.dispatchEvent(new CustomEvent('cartItemAdded', { detail: { productId: product.id } }));
      },

      // Function to check if a product is currently being added
      isAddingItem: (productId: number) => {
        return get().loadingItems.includes(productId);
      },

      removeItem: (productId: number) => {
        try {
          const { items } = get();
          const itemToRemove = items.find(item => item.product.id === productId);
          if (itemToRemove) {
            // Track remove from cart event with PixelYourSite
            pixelYourSiteService.trackCustomEvent('remove_from_cart', {
              product_id: itemToRemove.product.id,
              product_name: itemToRemove.product.name,
              value: parseFloat(itemToRemove.product.price.replace(/[^\d.-]/g, '')) * itemToRemove.quantity,
              quantity: itemToRemove.quantity,
              currency: 'BDT',
            });
          }

          const updatedItems = items.filter(item => item.product.id !== productId);
          set({ items: updatedItems });
          get().calculateTotals();
        } catch (error) {
          console.error('Error removing item from cart:', error);
        }
      },

      updateQuantity: (productId: number, quantity: number) => {
        try {
          const { items } = get();
          const existingItemIndex = items.findIndex(item => item.product.id === productId);

          if (existingItemIndex >= 0) {
            const item = items[existingItemIndex];
            if (quantity <= 0) {
              get().removeItem(productId);
              return;
            }

            // Check if the requested quantity exceeds available stock
            if (item.product.manage_stock && item.product.stock_quantity !== null && quantity > item.product.stock_quantity) {
              return;
            }

            const updatedItems = [...items];
            updatedItems[existingItemIndex] = {
              ...updatedItems[existingItemIndex],
              quantity
            };
            set({
              items: updatedItems
            });
            get().calculateTotals();

            // Track quantity update with PixelYourSite
            pixelYourSiteService.trackAddToCart({
              product_id: item.product.id,
              product_name: item.product.name,
              product_price: parseFloat(item.product.price.replace(/[^\d.-]/g, '')),
              currency: 'BDT',
              quantity: quantity,
              value: parseFloat(item.product.price.replace(/[^\d.-]/g, '')) * quantity,
            });
          }
        } catch (error) {
          console.error('Error updating cart item quantity:', error);
        }
      },

      clearCart: () => {
        try {
          set({ items: [] });
          get().calculateTotals();
        } catch (error) {
          console.error('Error clearing cart:', error);
        }
      },

      getCartItems: () => {
        try {
          return get().items;
        } catch (error) {
          console.error('Error getting cart items:', error);
          return [];
        }
      },

      // Get specific cart item by product ID
      getCartItem: (productId: number) => {
        try {
          return get().items.find(item => item.product.id === productId) || null;
        } catch (error) {
          console.error('Error getting cart item:', error);
          return null;
        }
      },

      // Check if a product is in cart
      isInCart: (productId: number) => {
        try {
          return get().items.some(item => item.product.id === productId);
        } catch (error) {
          console.error('Error checking if item is in cart:', error);
          return false;
        }
      },

      // Get total quantity of a specific product in cart
      getProductQuantity: (productId: number) => {
        try {
          const item = get().items.find(item => item.product.id === productId);
          return item ? item.quantity : 0;
        } catch (error) {
          console.error('Error getting product quantity:', error);
          return 0;
        }
      },

      // Calculate totals helper function
      calculateTotals: () => {
        try {
          const { items } = get();
          let totalItems = 0;
          let totalPrice = 0;

          // Use for loop instead of reduce for better performance with large arrays
          for (let i = 0; i < items.length; i++) {
            const item = items[i];
            totalItems += item.quantity || 0;

            // Convert price string to number and multiply by quantity
            // Handle both string and number formats for price
            let price: number;
            if (typeof item.product.price === 'string') {
              price = parseFloat(item.product.price.replace(/[^\d.-]/g, '')) || 0;
            } else {
              price = parseFloat(String(item.product.price)) || 0;
            }
            totalPrice += (price * (item.quantity || 0));
          }

          set({
            totalItems,
            totalPrice: parseFloat(totalPrice.toFixed(2)) // Round to 2 decimal places
          });
        } catch (error) {
          console.error('Error calculating cart totals:', error);
          set({
            totalItems: 0,
            totalPrice: 0
          });
        }
      }
    }),
    {
      name: APP_CONSTANTS.CART_STORAGE_KEY, // name of the item in the storage (must be unique)
      storage: conditionalStorage, // use custom storage that checks auth state
    }
  )
);
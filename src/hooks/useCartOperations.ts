import { useCartStore } from '../store/cartStore';
import type { Product } from '../types/product';

// Custom hook to encapsulate cart operations
export const useCartOperations = () => {
  const { 
    addItem, 
    removeItem, 
    updateQuantity, 
    clearCart, 
    getCartItems, 
    getCartItem,
    isInCart,
    getProductQuantity,
    totalItems,
    totalPrice
  } = useCartStore();

  // Add to cart with validation
  const addToCart = (product: Product, quantity: number = 1) => {
    try {
      if (quantity > 0) {
        addItem(product, quantity);
      }
    } catch (error) {
      console.error('Error adding item to cart:', error);
    }
  };

  // Remove from cart
  const removeFromCart = (productId: number) => {
    try {
      removeItem(productId);
    } catch (error) {
      console.error('Error removing item from cart:', error);
    }
  };

  // Update item quantity
  const updateCartItem = (productId: number, quantity: number) => {
    try {
      updateQuantity(productId, quantity);
    } catch (error) {
      console.error('Error updating cart item quantity:', error);
    }
  };

  // Check if item is in cart and return quantity
  const isItemInCart = (productId: number): { inCart: boolean; quantity: number } => {
    try {
      const inCart = isInCart(productId);
      const quantity = inCart ? getProductQuantity(productId) : 0;
      return { inCart, quantity };
    } catch (error) {
      console.error('Error checking if item is in cart:', error);
      return { inCart: false, quantity: 0 };
    }
  };

  return {
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
    getCartItems,
    getCartItem,
    isItemInCart,
    totalItems,
    totalPrice,
  };
};
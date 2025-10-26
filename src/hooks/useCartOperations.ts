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
    if (quantity > 0) {
      addItem(product, quantity);
    }
  };

  // Remove from cart
  const removeFromCart = (productId: number) => {
    removeItem(productId);
  };

  // Update item quantity
  const updateCartItem = (productId: number, quantity: number) => {
    updateQuantity(productId, quantity);
  };

  // Check if item is in cart and return quantity
  const isItemInCart = (productId: number): { inCart: boolean; quantity: number } => {
    const inCart = isInCart(productId);
    const quantity = inCart ? getProductQuantity(productId) : 0;
    return { inCart, quantity };
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
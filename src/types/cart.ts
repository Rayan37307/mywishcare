import type { Product } from './product';

export interface CartItem {
  product: Product;
  quantity: number;
  selectedOptions?: Record<string, string>; // For size, color, etc.
}

export interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getCartItems: () => CartItem[];
  getCartItem: (productId: number) => CartItem | null;
  isInCart: (productId: number) => boolean;
  getProductQuantity: (productId: number) => number;
  calculateTotals: () => void;
}
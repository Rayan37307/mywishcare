import { memo } from 'react';
import type { CartItem as CartItemType } from '../types/cart';

interface CartItemProps {
  item: CartItemType;
  updateQuantity: (productId: number, quantity: number) => void;
  removeItem: (productId: number) => void;
}

const CartItem = memo(({ item, updateQuantity, removeItem }: CartItemProps) => {
  const { product, quantity } = item;

  return (
    <div
      key={product.id}
      className="flex items-center pb-4"
    >
      <img
        src={product.images[0]?.src || "/placeholder.webp"}
        alt={product.name}
        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded flex-shrink-0"
      />
      <div className="flex-1 min-w-0 ml-3">
        <h3 className="text-xs sm:text-sm font-medium text-gray-900 truncate">
          {product.name}
        </h3>
        <div className="text-[9px] max-md:text-[8px] mt-1">
          {product.sale_price && product.sale_price !== '' && product.sale_price !== product.regular_price ? (
            <div className="flex items-center gap-0.5">
              <span className="text-red-500">₹{product.sale_price}</span>
              <span className="line-through text-gray-600 text-[8px] max-md:text-[7px]">₹{product.regular_price}</span>
            </div>
          ) : (
            <span>₹{product.price}</span>
          )}
        </div>
        <div className="flex items-center mt-2 space-x-2">
          <button
            className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center border border-gray-300 text-sm"
            onClick={() => {
              try {
                updateQuantity(product.id, quantity - 1);
              } catch (error) {
                console.error('Error updating quantity:', error);
              }
            }}
          >
            -
          </button>
          <span className="text-sm min-w-[20px] text-center">{quantity}</span>
          <button
            className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center border border-gray-300 text-sm"
            onClick={() => {
              try {
                updateQuantity(product.id, quantity + 1);
              } catch (error) {
                console.error('Error updating quantity:', error);
              }
            }}
          >
            +
          </button>
          <button
            className="text-gray-600 underline text-xs sm:text-sm ml-2"
            onClick={() => {
              try {
                removeItem(product.id);
              } catch (error) {
                console.error('Error removing item:', error);
              }
            }}
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
});

CartItem.displayName = 'CartItem';

export default CartItem;
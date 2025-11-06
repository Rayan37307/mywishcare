
import { useCartStore } from '../store/cartStore';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const { items, totalItems, totalPrice, updateQuantity, removeItem, clearCart } = useCartStore();
  const navigate = useNavigate();

  const handleCheckout = () => {
    // In a WooCommerce integration, this would typically redirect to the checkout page
    // For now, we'll just navigate to a placeholder checkout page
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="bg-white py-10">
        <div className="container mx-auto max-w-7xl p-4">
          <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
          <p className="text-lg">Your cart is empty.</p>
          <button 
            className="mt-4 px-6 py-3 bg-black text-white uppercase"
            onClick={() => navigate('/')}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white py-10">
      <div className="container mx-auto max-w-7xl p-4">
        <h1 className="text-3xl font-bold mb-6">Your Cart ({totalItems} items)</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.product.id} className="flex items-center border-b pb-4">
                  <img 
                    src={item.product.images[0]?.src || '/placeholder.webp'} 
                    alt={item.product.name} 
                    className="w-24 h-24 object-cover rounded"
                  />
                  <div className="ml-4 flex-1">
                    <h3 className="font-bold">{item.product.name}</h3>
                    <p className="text-gray-600">৳{item.product.price}</p>
                  </div>
                  <div className="flex items-center">
                    <button 
                      className="px-3 py-1 border border-gray-300"
                      onClick={() => {
                        try {
                          updateQuantity(item.product.id, item.quantity - 1);
                        } catch (error) {
                          console.error('Error updating quantity:', error);
                        }
                      }}
                    >
                      -
                    </button>
                    <span className="px-3">{item.quantity}</span>
                    <button 
                      className="px-3 py-1 border border-gray-300"
                      onClick={() => {
                        try {
                          updateQuantity(item.product.id, item.quantity + 1);
                        } catch (error) {
                          console.error('Error updating quantity:', error);
                        }
                      }}
                    >
                      +
                    </button>
                  </div>
                  <div className="ml-4">
                    <p className="font-bold">
                      ৳{
                        (() => {
                          let price: number;
                          if (typeof item.product.price === 'string') {
                            price = parseFloat(item.product.price.replace(/[^\d.-]/g, '')) || 0;
                          } else {
                            price = parseFloat(String(item.product.price)) || 0;
                          }
                          return (price * item.quantity).toFixed(2);
                        })()
                      }
                    </p>
                  </div>
                  <button 
                    className="ml-6 text-red-600 hover:text-red-800"
                    onClick={() => {
                      try {
                        removeItem(item.product.id);
                      } catch (error) {
                        console.error('Error removing item:', error);
                      }
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex gap-4">
              <button 
                className="px-6 py-3 bg-gray-200"
                onClick={() => {
                  try {
                    clearCart();
                  } catch (error) {
                    console.error('Error clearing cart:', error);
                  }
                }}
              >
                Clear Cart
              </button>
              <button 
                className="px-6 py-3 bg-gray-800 text-white"
                onClick={() => navigate('/')}
              >
                Continue Shopping
              </button>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <div className="border p-6 rounded">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              
              <div className="flex justify-between mb-2">
                <span>Subtotal</span>
                <span>৳{totalPrice.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between mb-2">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              

              
              <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                <span>Total</span>
                <span>৳{totalPrice.toFixed(2)}</span>
              </div>
              
              <button 
                className="w-full mt-6 py-3 bg-black text-white uppercase"
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
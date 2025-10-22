import React from 'react';
import { useCartStore } from '../store/cartStore';
import { woocommerceService } from '../services/woocommerceService';

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCartStore();
  const [formData, setFormData] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    notes: ''
  });
  const [isLoading, setIsLoading] = React.useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const orderData = {
      payment_method: 'cod',
      payment_method_title: 'Cash on Delivery',
      set_paid: false,
      billing: {
        first_name: formData.firstName,
        last_name: formData.lastName,
        address_1: formData.address,
        city: formData.city,
        state: formData.state,
        postcode: formData.zip,
        country: 'IN', // Assuming India, you might want to make this dynamic
        email: formData.email,
        phone: formData.phone,
      },
      shipping: {
        first_name: formData.firstName,
        last_name: formData.lastName,
        address_1: formData.address,
        city: formData.city,
        state: formData.state,
        postcode: formData.zip,
        country: 'IN', // Assuming India
      },
      line_items: items.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
      })),
      customer_note: formData.notes,
    };

    try {
      await woocommerceService.createOrder(orderData);
      alert('Order placed successfully!');
      clearCart();
      // You might want to redirect to a thank you page
      // navigate('/thank-you');
    } catch (error) {
      console.error('Failed to place order:', error);
      alert('There was an error placing your order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-white py-10">
        <div className="container mx-auto max-w-7xl p-4">
          <h1 className="text-3xl font-bold mb-6">Checkout</h1>
          <p className="text-lg">Your cart is empty. Please add items to your cart before checking out.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white py-10">
      <div className="container mx-auto max-w-7xl p-4">
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-bold mb-4">Shipping Information</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block mb-1">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="mt-4">
                <label className="block mb-1">Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="mt-4">
                <label className="block mb-1">Address *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block mb-1">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block mb-1">State *</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block mb-1">ZIP Code *</label>
                  <input
                    type="text"
                    name="zip"
                    value={formData.zip}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block mb-1">Order Notes (Optional)</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  rows={4}
                  disabled={isLoading}
                />
              </div>
              
              <button 
                type="submit" 
                className="mt-6 w-full py-3 bg-black text-white uppercase disabled:bg-gray-400"
                disabled={isLoading}
              >
                {isLoading ? 'Placing Order...' : 'Place Order'}
              </button>
            </form>
          </div>
          
          <div>
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            
            <div className="border p-4 rounded">
              {items.map((item) => (
                <div key={item.product.id} className="flex justify-between py-2 border-b">
                  <div>
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  <p>₹{(parseFloat(item.product.price.replace(/[^\]d.-]/g, '')) * item.quantity).toFixed(2)}</p>
                </div>
              ))}
              
              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{totalPrice.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>

                <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                  <span>Payment Method</span>
                  <span>Cash on Delivery</span>
                </div>
                
                <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                  <span>Total</span>
                  <span>₹{totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
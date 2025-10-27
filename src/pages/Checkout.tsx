import React, { useState, useEffect } from 'react';
import { useCartStore } from '../store/cartStore';
import { woocommerceService } from '../services/woocommerceService';
import { useAuth } from '../hooks/useAuth';
import { useOrder } from '../contexts/OrderContext';

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    phone: '',
    countryCode: 'IN',
    zone: '',
    marketingOptIn: true,
    saveShippingInfo: false,
    billingAddressSame: true,
    paymentMethod: 'cod',
    notes: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  // Pre-populate form fields if user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        email: user.email,
        firstName: user.displayName.split(' ')[0] || user.username,
        lastName: user.displayName.split(' ').slice(1).join(' ') || '',
      }));
    }
  }, [isAuthenticated, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: target.checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const { refreshOrders } = useOrder(); // Get the refreshOrders function

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Include customer ID in order data if user is authenticated
    const orderData: any = {
      payment_method: formData.paymentMethod,
      payment_method_title: 'Cash on Delivery',
      set_paid: false,
      billing: {
        first_name: formData.firstName,
        last_name: formData.lastName,
        address_1: formData.address1,
        address_2: formData.address2,
        city: formData.city,
        state: formData.zone,
        postcode: formData.postalCode,
        country: formData.countryCode,
        email: formData.email,
        phone: formData.phone,
      },
      shipping: {
        first_name: formData.firstName,
        last_name: formData.lastName,
        address_1: formData.address1,
        address_2: formData.address2,
        city: formData.city,
        state: formData.zone,
        postcode: formData.postalCode,
        country: formData.countryCode,
      },
      line_items: items.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
      })),
      customer_note: formData.notes,
    };

    // Add customer ID if user is authenticated
    if (isAuthenticated && user) {
      // Use the user ID which should correspond to the WooCommerce customer ID
      // In WordPress/WooCommerce, the user ID is typically the same as the customer ID
      orderData.customer_id = user.id;
      console.log('Setting customer ID for order:', user.id); // Debug log
    } else {
      // If not authenticated, the order will be guest order
      console.log('Creating guest order without customer ID');
    }

    try {
      console.log('Creating order with data:', orderData); // Debug log
      const newOrder = await woocommerceService.createOrder(orderData);
      console.log('Order created successfully:', newOrder); // Debug log
      
      if (newOrder && newOrder.customer_id) {
        console.log(`Order created for customer ID: ${newOrder.customer_id}`); // Debug log
      }
      
      alert('Order placed successfully!');
      clearCart();
      
      // Refresh orders to include the new one
      if (refreshOrders) {
        console.log('Refreshing orders after successful checkout'); // Debug log
        await refreshOrders();
      }
      
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
            <form id="checkoutForm" onSubmit={handleSubmit} className="space-y-8">
              {/* Contact Section */}
              <section aria-label="Contact" className="border-b pb-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 id="contact" className="text-xl font-bold">Contact</h2>
                  {isAuthenticated ? (
                    <div className="text-sm">
                      Signed in as <span className="font-medium">{user?.email}</span>
                      <button 
                        type="button"
                        onClick={() => {
                          // Implement logout or change account
                        }}
                        className="ml-2 text-blue-600 hover:underline"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <a href="/login" className="text-blue-600 hover:underline text-sm">
                      Sign in
                    </a>
                  )}
                </div>
                
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium mb-1">
                    Email or mobile phone number
                  </label>
                  <input 
                    id="email" 
                    name="email" 
                    placeholder="Email or mobile phone number" 
                    required 
                    type="text" 
                    inputMode="text" 
                    aria-required="true" 
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="shipping email" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="marketing_opt_in" 
                    name="marketingOptIn" 
                    checked={formData.marketingOptIn}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="marketing_opt_in" className="text-sm text-gray-700">
                    Email me with news and offers
                  </label>
                </div>
              </section>
              
              {/* Delivery Section */}
              <section aria-label="Delivery" className="border-b pb-8">
                <h2 id="deliveryAddress" className="text-xl font-bold mb-6">Delivery</h2>
                
                <div className="mb-4">
                  <label htmlFor="Select960" className="block text-sm font-medium mb-1">
                    Country/Region
                  </label>
                  <div className="relative">
                    <select 
                      name="countryCode" 
                      id="Select960" 
                      required 
                      value={formData.countryCode}
                      onChange={handleChange}
                      autoComplete="shipping country" 
                      className="w-full px-4 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                    >
                      <option value="IN">India</option>
                      {/* Add more options as needed */}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="TextField4443" className="block text-sm font-medium mb-1">
                      First name
                    </label>
                    <input 
                      id="TextField4443" 
                      name="firstName" 
                      placeholder="First name" 
                      required 
                      type="text" 
                      aria-required="true" 
                      value={formData.firstName}
                      onChange={handleChange}
                      autoComplete="shipping given-name" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="TextField4444" className="block text-sm font-medium mb-1">
                      Last name
                    </label>
                    <input 
                      id="TextField4444" 
                      name="lastName" 
                      placeholder="Last name" 
                      required 
                      type="text" 
                      aria-required="true" 
                      value={formData.lastName}
                      onChange={handleChange}
                      autoComplete="shipping family-name" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="shipping-address1" className="block text-sm font-medium mb-1">
                    Address
                  </label>
                  <input 
                    id="shipping-address1" 
                    name="address1" 
                    placeholder="Address" 
                    required 
                    type="text" 
                    aria-autocomplete="list" 
                    aria-expanded="false" 
                    aria-required="true" 
                    aria-labelledby="shipping-address1-label" 
                    aria-haspopup="listbox" 
                    role="combobox" 
                    value={formData.address1}
                    onChange={handleChange}
                    autoComplete="shipping address-line1" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="TextField4445" className="block text-sm font-medium mb-1">
                    Apartment, suite, etc. (optional)
                  </label>
                  <input 
                    id="TextField4445" 
                    name="address2" 
                    placeholder="Apartment, suite, etc. (optional)" 
                    type="text" 
                    aria-required="false" 
                    value={formData.address2}
                    onChange={handleChange}
                    autoComplete="shipping address-line2" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="md:col-span-2">
                    <label htmlFor="TextField4446" className="block text-sm font-medium mb-1">
                      City
                    </label>
                    <input 
                      id="TextField4446" 
                      name="city" 
                      placeholder="City" 
                      required 
                      type="text" 
                      aria-required="true" 
                      value={formData.city}
                      onChange={handleChange}
                      autoComplete="shipping address-level2" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="Select961" className="block text-sm font-medium mb-1">
                      State
                    </label>
                    <div className="relative">
                      <select 
                        name="zone" 
                        id="Select961" 
                        required 
                        value={formData.zone}
                        onChange={handleChange}
                        autoComplete="shipping address-level1" 
                        className="w-full px-4 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                      >
                        <option value="" hidden disabled>&nbsp;</option>
                        <option value="AN">Andaman and Nicobar Islands</option>
                        <option value="AP">Andhra Pradesh</option>
                        <option value="AR">Arunachal Pradesh</option>
                        <option value="AS">Assam</option>
                        <option value="BR">Bihar</option>
                        <option value="CH">Chandigarh</option>
                        <option value="CG">Chhattisgarh</option>
                        <option value="DN">Dadra and Nagar Haveli</option>
                        <option value="DD">Daman and Diu</option>
                        <option value="DL">Delhi</option>
                        <option value="GA">Goa</option>
                        <option value="GJ">Gujarat</option>
                        <option value="HR">Haryana</option>
                        <option value="HP">Himachal Pradesh</option>
                        <option value="JK">Jammu and Kashmir</option>
                        <option value="JH">Jharkhand</option>
                        <option value="KA">Karnataka</option>
                        <option value="KL">Kerala</option>
                        <option value="LA">Ladakh</option>
                        <option value="LD">Lakshadweep</option>
                        <option value="MP">Madhya Pradesh</option>
                        <option value="MH">Maharashtra</option>
                        <option value="MN">Manipur</option>
                        <option value="ML">Meghalaya</option>
                        <option value="MZ">Mizoram</option>
                        <option value="NL">Nagaland</option>
                        <option value="OR">Odisha</option>
                        <option value="PY">Puducherry</option>
                        <option value="PB">Punjab</option>
                        <option value="RJ">Rajasthan</option>
                        <option value="SK">Sikkim</option>
                        <option value="TN">Tamil Nadu</option>
                        <option value="TS">Telangana</option>
                        <option value="TR">Tripura</option>
                        <option value="UP">Uttar Pradesh</option>
                        <option value="UK">Uttarakhand</option>
                        <option value="WB">West Bengal</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="TextField4447" className="block text-sm font-medium mb-1">
                      PIN code
                    </label>
                    <input 
                      id="TextField4447" 
                      name="postalCode" 
                      placeholder="PIN code" 
                      required 
                      type="text" 
                      inputMode="numeric" 
                      aria-required="true" 
                      value={formData.postalCode}
                      onChange={handleChange}
                      autoComplete="shipping postal-code" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="TextField4448" className="block text-sm font-medium mb-1">
                    Phone
                  </label>
                  <input 
                    id="TextField4448" 
                    name="phone" 
                    placeholder="Phone" 
                    required 
                    type="tel" 
                    aria-required="true" 
                    value={formData.phone}
                    onChange={handleChange}
                    autoComplete="shipping tel" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="save_shipping_information" 
                    name="saveShippingInfo" 
                    checked={formData.saveShippingInfo}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="save_shipping_information" className="text-sm text-gray-700">
                    Save this information for next time
                  </label>
                </div>
              </section>
              
              {/* Payment Section */}
              <section aria-label="Payment" className="border-b pb-8">
                <h2 id="payment" className="text-xl font-bold mb-4">Payment</h2>
                
                <div className="space-y-4">
                  <div className="border rounded-lg p-4 bg-blue-50">
                    <div className="flex items-center space-x-3">
                      <input 
                        type="radio" 
                        id="basic-cod" 
                        name="paymentMethod" 
                        value="cod"
                        checked={formData.paymentMethod === 'cod'}
                        onChange={handleChange}
                        aria-label="Cash On Delivery" 
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        defaultChecked
                      />
                      <label htmlFor="basic-cod" className="font-medium">
                        Cash On Delivery (CoD)
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-3">Billing address</h3>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <input 
                        type="radio" 
                        id="billing_address_selector-shipping_address" 
                        name="billingAddressSame" 
                        value="true"
                        checked={formData.billingAddressSame}
                        onChange={() => setFormData(prev => ({...prev, billingAddressSame: true}))}
                        aria-label="Same as shipping address" 
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <label htmlFor="billing_address_selector-shipping_address">
                        Same as shipping address
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input 
                        type="radio" 
                        id="billing_address_selector-custom_billing_address" 
                        name="billingAddressSame" 
                        value="false"
                        checked={!formData.billingAddressSame}
                        onChange={() => setFormData(prev => ({...prev, billingAddressSame: false}))}
                        aria-label="Use a different billing address" 
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <label htmlFor="billing_address_selector-custom_billing_address">
                        Use a different billing address
                      </label>
                    </div>
                  </div>
                </div>
              </section>
              
              <button 
                aria-busy="false" 
                aria-live="polite" 
                id="checkout-pay-button" 
                type="submit" 
                form="checkoutForm"
                className="w-full py-4 bg-black text-white font-bold uppercase hover:bg-gray-800 disabled:bg-gray-400 transition-colors duration-200"
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : `Pay ₹${totalPrice.toFixed(2)}`}
              </button>
            </form>
          </div>
          
          <div>
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            
            <div className="border p-4 rounded-lg">
              {items.map((item) => (
                <div key={item.product.id} className="flex justify-between py-3 border-b">
                  <div>
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  <p>₹{(parseFloat(item.product.price.replace(/[^\d.-]/g, '')) * item.quantity).toFixed(2)}</p>
                </div>
              ))}
              
              <div className="space-y-3 mt-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{totalPrice.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>

                <div className="flex justify-between font-semibold pt-2 border-t">
                  <span>Payment Method</span>
                  <span>Cash on Delivery</span>
                </div>
                
                <div className="flex justify-between font-bold pt-2 border-t text-lg">
                  <span>Total</span>
                  <span>₹{totalPrice.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="mt-6">
                <label className="block text-sm font-medium mb-2">Order Notes (Optional)</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Special instructions for delivery"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
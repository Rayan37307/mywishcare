import React, { useState, useEffect, useRef } from 'react';
import { useCartStore } from '../store/cartStore';
import { woocommerceService } from '../services/woocommerceService';
import { useAuth } from '../hooks/useAuth';
import { useOrder } from '../contexts/OrderContext';
import { analyticsService } from '../services/analyticsService';
import { checkoutTrackingService } from '../services/checkoutTrackingService';
import { fakeOrderBlockingService } from '../services/fakeOrderBlockingService';
import { pixelConfirmationService } from '../services/pixelConfirmationService';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { refreshOrders } = useOrder();

  const [formData, setFormData] = useState({
    name: '',
    address1: '',
    district: '',
    phone: '',
    email: '',
    countryCode: 'BD',
    marketingOptIn: true,
    saveShippingInfo: false,
    billingAddressSame: true,
    billingName: '',
    billingAddress1: '',
    billingDistrict: '',
    paymentMethod: 'cod',
    notes: '',
  });
  const [couponCode, setCouponCode] = useState('');
  const [isCouponLoading, setIsCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const hasTrackedStart = useRef(false);

  // Pre-fill user info if authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        name: user.displayName || user.username,
        email: user.email || '',
      }));
    }
  }, [isAuthenticated, user]);

  // Track checkout start
  useEffect(() => {
    if (items.length > 0 && !hasTrackedStart.current) {
      const newSessionId = checkoutTrackingService.trackCheckoutStart(
        formData,
        items,
        totalPrice
      );
      setSessionId(newSessionId);
      hasTrackedStart.current = true;

      analyticsService.trackCheckoutStart({
        value: totalPrice,
        currency: 'BDT',
        contents: items.map(item => ({
          id: item.product.id,
          quantity: item.quantity,
          item_price: parseFloat(item.product.price.replace(/[^\d.-]/g, '')),
        })),
        content_type: 'product',
      });
    }
  }, [items, formData, totalPrice]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => {
      const updatedData = { ...prev, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value };
      if (sessionId) checkoutTrackingService.trackFormChange(sessionId, updatedData);
      return updatedData;
    });
  };

  const getIP = (): string => localStorage.getItem('userIP') || 'unknown';

  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return false;
    }

    setIsCouponLoading(true);
    setCouponError('');
    setCouponSuccess('');

    try {
      // Check if coupon is valid using WooCommerce API
      const couponData = await woocommerceService.getCouponByCode(couponCode.trim());
      
      if (!couponData) {
        setCouponError('Invalid coupon code');
        setIsCouponLoading(false);
        return false;
      }

      // Check if coupon is valid for current cart total (if minimum amount is set)
      if (couponData.minimum_amount && parseFloat(couponData.minimum_amount) > totalPrice) {
        setCouponError(`Minimum order amount of BDT ${couponData.minimum_amount} required`);
        setIsCouponLoading(false);
        return false;
      }

      // Set success message and apply coupon
      setCouponSuccess(`Coupon applied: ${couponData.code} (${couponData.discount_type === 'percent' ? couponData.amount + '%' : 'BDT' + couponData.amount} off)`);
      setAppliedCoupon(couponData);
      setIsCouponLoading(false);
      return true;
    } catch (error) {
      console.error('Error validating coupon:', error);
      setCouponError('Failed to validate coupon. Please try again.');
      setIsCouponLoading(false);
      return false;
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setCouponError('');
    setCouponSuccess('');
    setAppliedCoupon(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const orderForFraudCheck = {
      name: formData.name,
      address1: formData.address1,
      state: formData.district,
      phone: formData.phone,
      email: formData.email,
      items: items.map(item => ({ product_id: item.product.id, quantity: item.quantity })),
      total: totalPrice,
      ip: getIP(),
      timestamp: Date.now(),
    };

    const fraudResult = fakeOrderBlockingService.processOrder(orderForFraudCheck);
    if (fraudResult.shouldBlock) {
      alert(`Order blocked: ${fraudResult.reasons.join(', ')}`);
      setIsLoading(false);
      return;
    }

    const orderData: any = {
      payment_method: formData.paymentMethod,
      payment_method_title: 'Cash on Delivery',
      set_paid: false,
      billing: {
        first_name: formData.billingAddressSame ? formData.name : formData.billingName,
        address_1: formData.billingAddressSame ? formData.address1 : formData.billingAddress1,
        state: formData.billingAddressSame ? formData.district : formData.billingDistrict,
        country: formData.countryCode,
        phone: formData.phone,
        email: formData.email,
      },
      shipping: {
        first_name: formData.name,
        address_1: formData.address1,
        state: formData.district,
        country: formData.countryCode,
      },
      line_items: items.map(item => ({ product_id: item.product.id, quantity: item.quantity })),
      customer_note: formData.notes,
    };

    // Add coupon code if one is applied
    if (appliedCoupon) {
      orderData.coupon_lines = [
        {
          code: couponCode.trim()
        }
      ];
    }

    if (isAuthenticated && user) orderData.customer_id = user.id;

    try {
      const newOrder = await woocommerceService.createOrder(orderData);

      if (newOrder?.id) {
        analyticsService.trackPurchase({
          value: totalPrice,
          currency: 'BDT',
          contents: items.map(item => ({
            id: item.product.id,
            quantity: item.quantity,
            item_price: parseFloat(item.product.price.replace(/[^\d.-]/g, '')),
          })),
          content_type: 'product',
        }, newOrder.id.toString());

        pixelConfirmationService.trackOrder({
          orderId: newOrder.id.toString(),
          value: totalPrice,
          currency: 'BDT',
          contents: items.map(item => ({
            id: item.product.id,
            quantity: item.quantity,
            item_price: parseFloat(item.product.price.replace(/[^\d.-]/g, '')),
          })),
          phone: formData.phone,
          customerName: formData.name,
          email: formData.email,
          timestamp: Date.now(),
        });
      }

      if (sessionId) checkoutTrackingService.trackCheckoutComplete(sessionId);

      alert('Order placed successfully!');
      clearCart();
      refreshOrders && await refreshOrders();
      navigate(ROUTES.ORDER_SUCCESS, { state: { order: newOrder, total: totalPrice } });
    } catch (error) {
      console.error(error);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-white py-10">
        <div className="container mx-auto max-w-7xl p-4">
          <h1 className="text-3xl font-bold mb-6">Checkout</h1>
          <p className="text-lg">Your cart is empty. Please add items to checkout.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white py-10">
      <div className="container mx-auto max-w-7xl p-4">
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div>
            <form id="checkoutForm" onSubmit={handleSubmit} className="space-y-8">
              {/* Delivery & Payment sections here (keep existing fields) */}

              
              {/* Delivery Section */}
              <section aria-label="Delivery" className="border-b pb-8">
                <h2 id="deliveryAddress" className="text-xl font-bold mb-6">Delivery</h2>
                

                
                <div className="mb-4">
                  <label htmlFor="Select960" className="block text-sm font-medium mb-1">
                    Country/Region <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select 
                      name="countryCode" 
                      id="Select960" 
                      required 
                      value="BD"
                      onChange={handleChange}
                      autoComplete="shipping country" 
                      className="w-full px-4 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                    >
                      <option value="BD">Bangladesh</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input 
                    id="name" 
                    name="name" 
                    placeholder="Full Name" 
                    required 
                    type="text" 
                    aria-required="true" 
                    value={formData.name}
                    onChange={handleChange}
                    autoComplete="shipping name" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="shipping-address1" className="block text-sm font-medium mb-1">
                    Address <span className="text-red-500">*</span>
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
                  <label htmlFor="Select961" className="block text-sm font-medium mb-1">
                    District <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select 
                      name="district" 
                      id="Select961" 
                      required 
                      value={formData.district}
                      onChange={handleChange}
                      autoComplete="shipping address-level1" 
                      className="w-full px-4 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                    >
                      <option value="" hidden disabled>&nbsp;</option>
                      <option value="dhaka">Dhaka</option>
                      <option value="gazipur">Gazipur</option>
                      <option value="kishoreganj">Kishoreganj</option>
                      <option value="manikganj">Manikganj</option>
                      <option value="munshiganj">Munshiganj</option>
                      <option value="narayanganj">Narayanganj</option>
                      <option value="narsingdi">Narsingdi</option>
                      <option value="tangail">Tangail</option>
                      <option value="faridpur">Faridpur</option>
                      <option value="gopalganj">Gopalganj</option>
                      <option value="madaripur">Madaripur</option>
                      <option value="rajbari">Rajbari</option>
                      <option value="shariatpur">Shariatpur</option>
                      <option value="chattogram">Chattogram</option>
                      <option value="coxs-bazar">Cox's Bazar</option>
                      <option value="cumilla">Cumilla</option>
                      <option value="brahmanbaria">Brahmanbaria</option>
                      <option value="chandpur">Chandpur</option>
                      <option value="feni">Feni</option>
                      <option value="lakshmipur">Lakshmipur</option>
                      <option value="noakhali">Noakhali</option>
                      <option value="khagrachhari">Khagrachhari</option>
                      <option value="rangamati">Rangamati</option>
                      <option value="bandarban">Bandarban</option>
                      <option value="khulna">Khulna</option>
                      <option value="bagerhat">Bagerhat</option>
                      <option value="satkhira">Satkhira</option>
                      <option value="jessore">Jessore</option>
                      <option value="jhenaidah">Jhenaidah</option>
                      <option value="magura">Magura</option>
                      <option value="narail">Narail</option>
                      <option value="kushtia">Kushtia</option>
                      <option value="chuadanga">Chuadanga</option>
                      <option value="meherpur">Meherpur</option>
                      <option value="rajshahi">Rajshahi</option>
                      <option value="naogaon">Naogaon</option>
                      <option value="natore">Natore</option>
                      <option value="chapainawabganj">Chapainawabganj</option>
                      <option value="pabna">Pabna</option>
                      <option value="sirajganj">Sirajganj</option>
                      <option value="bogura">Bogura</option>
                      <option value="joypurhat">Joypurhat</option>
                      <option value="rangpur">Rangpur</option>
                      <option value="kurigram">Kurigram</option>
                      <option value="lalmonirhat">Lalmonirhat</option>
                      <option value="nilphamari">Nilphamari</option>
                      <option value="gaibandha">Gaibandha</option>
                      <option value="thakurgaon">Thakurgaon</option>
                      <option value="panchagarh">Panchagarh</option>
                      <option value="dinajpur">Dinajpur</option>
                      <option value="barishal">Barishal</option>
                      <option value="barguna">Barguna</option>
                      <option value="bhola">Bhola</option>
                      <option value="jhalokathi">Jhalokathi</option>
                      <option value="patuakhali">Patuakhali</option>
                      <option value="pirojpur">Pirojpur</option>
                      <option value="sylhet">Sylhet</option>
                      <option value="habiganj">Habiganj</option>
                      <option value="moulvibazar">Moulvibazar</option>
                      <option value="sunamganj">Sunamganj</option>
                      <option value="mymensingh">Mymensingh</option>
                      <option value="jamalpur">Jamalpur</option>
                      <option value="sherpur">Sherpur</option>
                      <option value="netrokona">Netrokona</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                      </svg>
                    </div>
                  </div>
                </div>
                
               <div className="mb-4">
  <label
    htmlFor="TextField4448"
    className="block text-sm font-medium mb-1"
  >
    Phone <span className="text-red-500">*</span>
  </label>

  <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 overflow-hidden">
    {/* Prefix section */}
    <div className="flex items-center gap-2 bg-gray-50 px-3">
      <img
        src="https://flagcdn.com/w20/bd.png"
        alt="Bangladesh Flag"
        className="w-5 h-4 object-cover"
      />
      <span className="text-gray-700 text-sm">+880</span>
    </div>

    {/* Divider */}
    <div className="h-6 w-px bg-gray-300"></div>

    {/* Input */}
    <input
      id="TextField4448"
      name="phone"
      placeholder="1XXXXXXXXX"
      required
      type="tel"
      aria-required="true"
      value={formData.phone}
      onChange={(e) => {
        const value = e.target.value.replace(/[^0-9]/g, ''); // only digits
        if (value.length <= 10) {
          setFormData(prev => ({ ...prev, phone: value }));
          if (sessionId) checkoutTrackingService.trackFormChange(sessionId, { ...formData, phone: value });
        }
      }}
      pattern="[0-9]{10}"
      title="Enter a valid Bangladeshi phone number (without +880)"
      autoComplete="tel-national"
      className="w-full px-4 py-2 focus:outline-none text-gray-800"
    />
  </div>
</div>

                
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium mb-1">
                    Email (optional)
                  </label>
                  <input 
                    id="email" 
                    name="email" 
                    placeholder="Email (optional)" 
                    type="email" 
                    aria-required="false" 
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="shipping email" 
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
                
                {/* Coupon Code Section */}
                <div className="mt-6 p-4 border rounded-lg bg-gray-50">
                  <h3 className="text-lg font-medium mb-3">Have a discount code?</h3>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Enter coupon code"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={isCouponLoading || appliedCoupon !== null}
                    />
                    {appliedCoupon ? (
                      <button
                        type="button"
                        onClick={removeCoupon}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        disabled={isCouponLoading}
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={validateCoupon}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                        disabled={isCouponLoading || !couponCode.trim()}
                      >
                        {isCouponLoading ? 'Applying...' : 'Apply'}
                      </button>
                    )}
                  </div>
                  {couponError && <p className="text-red-500 text-sm mt-2">{couponError}</p>}
                  {couponSuccess && <p className="text-green-500 text-sm mt-2">{couponSuccess}</p>}
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
                  
                  {!formData.billingAddressSame && (
                    <div className="mt-4 space-y-4 border-t pt-4">
                      <div>
                        <label htmlFor="billing-name" className="block text-sm font-medium mb-1">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input 
                          id="billing-name" 
                          name="billingName" 
                          placeholder="Full Name" 
                          type="text" 
                          value={formData.billingName || ''} // Use billing name if available
                          onChange={(e) => setFormData(prev => ({...prev, billingName: e.target.value}))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="billing-address1" className="block text-sm font-medium mb-1">
                          Address <span className="text-red-500">*</span>
                        </label>
                        <input 
                          id="billing-address1" 
                          name="billingAddress1" 
                          placeholder="Address" 
                          type="text" 
                          value={formData.billingAddress1 || ''} // Use billing address if available
                          onChange={(e) => setFormData(prev => ({...prev, billingAddress1: e.target.value}))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="billing-district" className="block text-sm font-medium mb-1">
                          District <span className="text-red-500">*</span>
                        </label>
                        <select 
                          name="billingDistrict" 
                          id="billing-district"
                          value={formData.billingDistrict || ''} // Use billing district if available
                          onChange={(e) => setFormData(prev => ({...prev, billingDistrict: e.target.value}))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="" hidden disabled>&nbsp;</option>
                          <option value="dhaka">Dhaka</option>
                          <option value="gazipur">Gazipur</option>
                          <option value="kishoreganj">Kishoreganj</option>
                          <option value="manikganj">Manikganj</option>
                          <option value="munshiganj">Munshiganj</option>
                          <option value="narayanganj">Narayanganj</option>
                          <option value="narsingdi">Narsingdi</option>
                          <option value="tangail">Tangail</option>
                          <option value="faridpur">Faridpur</option>
                          <option value="gopalganj">Gopalganj</option>
                          <option value="madaripur">Madaripur</option>
                          <option value="rajbari">Rajbari</option>
                          <option value="shariatpur">Shariatpur</option>
                          <option value="chattogram">Chattogram</option>
                          <option value="coxs-bazar">Cox's Bazar</option>
                          <option value="cumilla">Cumilla</option>
                          <option value="brahmanbaria">Brahmanbaria</option>
                          <option value="chandpur">Chandpur</option>
                          <option value="feni">Feni</option>
                          <option value="lakshmipur">Lakshmipur</option>
                          <option value="noakhali">Noakhali</option>
                          <option value="khagrachhari">Khagrachhari</option>
                          <option value="rangamati">Rangamati</option>
                          <option value="bandarban">Bandarban</option>
                          <option value="khulna">Khulna</option>
                          <option value="bagerhat">Bagerhat</option>
                          <option value="satkhira">Satkhira</option>
                          <option value="jessore">Jessore</option>
                          <option value="jhenaidah">Jhenaidah</option>
                          <option value="magura">Magura</option>
                          <option value="narail">Narail</option>
                          <option value="kushtia">Kushtia</option>
                          <option value="chuadanga">Chuadanga</option>
                          <option value="meherpur">Meherpur</option>
                          <option value="rajshahi">Rajshahi</option>
                          <option value="naogaon">Naogaon</option>
                          <option value="natore">Natore</option>
                          <option value="chapainawabganj">Chapainawabganj</option>
                          <option value="pabna">Pabna</option>
                          <option value="sirajganj">Sirajganj</option>
                          <option value="bogura">Bogura</option>
                          <option value="joypurhat">Joypurhat</option>
                          <option value="rangpur">Rangpur</option>
                          <option value="kurigram">Kurigram</option>
                          <option value="lalmonirhat">Lalmonirhat</option>
                          <option value="nilphamari">Nilphamari</option>
                          <option value="gaibandha">Gaibandha</option>
                          <option value="thakurgaon">Thakurgaon</option>
                          <option value="panchagarh">Panchagarh</option>
                          <option value="dinajpur">Dinajpur</option>
                          <option value="barishal">Barishal</option>
                          <option value="barguna">Barguna</option>
                          <option value="bhola">Bhola</option>
                          <option value="jhalokathi">Jhalokathi</option>
                          <option value="patuakhali">Patuakhali</option>
                          <option value="pirojpur">Pirojpur</option>
                          <option value="sylhet">Sylhet</option>
                          <option value="habiganj">Habiganj</option>
                          <option value="moulvibazar">Moulvibazar</option>
                          <option value="sunamganj">Sunamganj</option>
                          <option value="mymensingh">Mymensingh</option>
                          <option value="jamalpur">Jamalpur</option>
                          <option value="sherpur">Sherpur</option>
                          <option value="netrokona">Netrokona</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Desktop pay button */}
              <div className="hidden lg:block">
                <button
                  type="submit"
                  form="checkoutForm"
                  disabled={isLoading}
                  className="w-full py-4 bg-black text-white font-bold uppercase"
                >
                  {isLoading ? 'Processing...' : `Pay BDT 
                    ${appliedCoupon 
                      ? (appliedCoupon.discount_type === 'percent' 
                          ? (totalPrice - (totalPrice * parseFloat(appliedCoupon.amount) / 100)).toFixed(2)
                          : (totalPrice - parseFloat(appliedCoupon.amount)).toFixed(2))
                      : totalPrice.toFixed(2)
                    }`}
                </button>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="border p-4 rounded-lg">
              {items.map(item => (
                <div key={item.product.id} className="flex justify-between py-3 border-b">
                  <div>
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  <p>BDT {(parseFloat(item.product.price.replace(/[^\d.-]/g, '')) * item.quantity).toFixed(2)}</p>
                </div>
              ))}
              <div className="space-y-3 mt-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>BDT {totalPrice.toFixed(2)}</span>
                </div>
                
                {/* Coupon Discount Section */}
                {appliedCoupon && (
                  <div className="flex justify-between">
                    <span>Discount ({couponCode}): </span>
                    <span className="text-red-600">
                      {appliedCoupon.discount_type === 'percent' 
                        ? `-${appliedCoupon.amount}%` 
                        : `-BDT${appliedCoupon.amount}`}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between"> <span>Shipping</span> <span>Free</span> </div>
                <div className="flex justify-between font-semibold pt-2 border-t">
                  <span>Payment Method</span>
                  <span>Cash on Delivery</span>
                </div>
                <div className="flex justify-between font-bold pt-2 border-t text-lg">
                  <span>Total</span>
                  <span>BDT 
                    {appliedCoupon 
                      ? (appliedCoupon.discount_type === 'percent' 
                          ? (totalPrice - (totalPrice * parseFloat(appliedCoupon.amount) / 100)).toFixed(2)
                          : (totalPrice - parseFloat(appliedCoupon.amount)).toFixed(2))
                      : totalPrice.toFixed(2)
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile pay button */}
        <div className="lg:hidden mt-4">
          <button
            type="submit"
            form="checkoutForm"
            disabled={isLoading}
            className="w-full py-4 bg-black text-white font-bold uppercase"
          >
            {isLoading ? 'Processing...' : `Pay BDT 
              ${appliedCoupon 
                ? (appliedCoupon.discount_type === 'percent' 
                    ? (totalPrice - (totalPrice * parseFloat(appliedCoupon.amount) / 100)).toFixed(2)
                    : (totalPrice - parseFloat(appliedCoupon.amount)).toFixed(2))
                : totalPrice.toFixed(2)
              }`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

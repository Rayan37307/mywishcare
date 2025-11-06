

const ShippingPolicy = () => {
  return (
    <div className='flex justify-center items-center flex-col py-10 px-10'>
      <br />
      <h3 className='uppercase text-3xl text-black text-center font-semibold pb-10'>Shipping Policy</h3>
      <br />
      <div className='text-sm max-w-4xl'>
        <p>At WishCare BD, we aim to deliver your products quickly and safely across Bangladesh. Please read our shipping policy carefully to understand how and when your order will reach you.</p>
        <br />

        <div className='font-bold py-2'>1. Order Processing Time</div>
        <p>We process and dispatch all domestic orders within 1–2 business days after order confirmation.</p>
        <p>International orders are processed within 3–5 business days, depending on stock availability and destination.</p>
        <p>Orders placed on weekends or public holidays will be processed on the next business day.</p>
        <br />

        <div className='font-bold py-2'>2. Estimated Delivery Time</div>
        <p>Once shipped, delivery timelines are as follows:</p>
        <ul className='list-disc pl-5 py-1'>
          <li>Metro & Tier 1 cities: 2–3 business days</li>
          <li>Tier 2 cities and other regions: 3–7 business days</li>
        </ul>
        <p>Please note that delivery times may vary depending on your location, courier efficiency, and external factors.</p>
        <br />

        <div className='font-bold py-2'>3. Delivery Partners</div>
        <p>We work with trusted and verified courier services across Bangladesh to ensure safe and timely delivery of your products.</p>
        <p>You will receive a tracking ID via SMS or email once your order has been shipped.</p>
        <br />

        <div className='font-bold py-2'>4. Shipping Charges</div>
        <p>Shipping costs are calculated based on your delivery location and order weight.</p>
        <p>The final shipping fee (if applicable) will be displayed at checkout before payment confirmation.</p>
        <br />

        <div className='font-bold py-2'>5. Delays and Exceptions</div>
        <p>While we always strive for on-time delivery, delays may occur in certain cases such as:</p>
        <ul className='list-disc pl-5 py-1'>
          <li>Technical or system errors in order processing</li>
          <li>Natural disasters (e.g., floods, heavy rain, cyclones, etc.)</li>
          <li>Political strikes, transport restrictions, or courier disruptions</li>
        </ul>
        <p>In such cases, delivery timelines may be extended.</p>
        <p>If your order is delayed, we encourage you to contact us via email or phone to verify the shipment status.</p>
        <ul className='list-disc pl-5 py-1'>
          <li>📧 Email: hello@wishcarebd.com</li>
          <li>📞 Phone: +8801921521717</li>
        </ul>
      </div>
    </div>
  )
}

export default ShippingPolicy


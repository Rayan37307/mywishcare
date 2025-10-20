import React from 'react';
import type { WishCareProductData } from '../../types/product';

interface ActiveOffersSectionProps {
  wishCare?: WishCareProductData;
}

const ActiveOffersSection: React.FC<ActiveOffersSectionProps> = ({ wishCare }) => {
  if (!wishCare?.activeOffers || wishCare.activeOffers.length === 0) {
    return null;
  }

  return (
    <div className="mb-8 p-3 bg-gray-200">
      <h2 className="text-xl font-bold mb-2 text-black">Active Offers</h2>
      <ul className="space-y-2">
        {wishCare.activeOffers.map((offer, index) => (
          <li key={index} className="flex items-center">
            <img src="/pricetag.webp" className='mr-2 w-5' alt="" />
            <span className="text-black">{offer}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActiveOffersSection;
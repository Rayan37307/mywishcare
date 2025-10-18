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
    <div className="mb-8 p-6 bg-blue-50 rounded-lg">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Active Offers</h2>
      <ul className="space-y-2">
        {wishCare.activeOffers.map((offer, index) => (
          <li key={index} className="flex items-center">
            <span className="mr-2 text-green-600">✓</span>
            <span className="text-gray-700">{offer}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActiveOffersSection;
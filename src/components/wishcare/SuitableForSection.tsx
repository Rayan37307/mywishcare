import React from 'react';
import type { WishCareProductData } from '../../types/product';

interface SuitableForSectionProps {
  wishCare?: WishCareProductData;
}

const SuitableForSection: React.FC<SuitableForSectionProps> = ({ wishCare }) => {
  if (!wishCare?.suitableFor || wishCare.suitableFor.length === 0) {
    return null;
  }

  return (
    <div className="mb-8 p-6 bg-purple-50 rounded-lg">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Suitable For</h2>
      <ul className="space-y-2">
        {wishCare.suitableFor.map((item, index) => (
          <li key={index} className="flex items-center">
            <span className="mr-2 text-purple-600">✓</span>
            <span className="text-gray-700">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SuitableForSection;
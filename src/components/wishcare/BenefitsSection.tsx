import React from 'react';
import type { WishCareProductData } from '../../types/product';

interface BenefitsSectionProps {
  wishCare?: WishCareProductData;
}

const BenefitsSection: React.FC<BenefitsSectionProps> = ({ wishCare }) => {
  if (!wishCare?.benefits || wishCare.benefits.length === 0) {
    return null;
  }

  return (
    <div className="mb-8 p-6 bg-green-50 rounded-lg">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Benefits</h2>
      <ul className="space-y-2">
        {wishCare.benefits.map((benefit, index) => (
          <li key={index} className="flex items-start">
            <span className="mr-2 text-green-600 mt-1">✓</span>
            <span className="text-gray-700">{benefit}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BenefitsSection;
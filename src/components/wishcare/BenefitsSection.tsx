import React from 'react';
import type { WishCareProductData } from '../../types/product';

interface BenefitsSectionProps {
  wishCare?: WishCareProductData;
}

const BenefitsSection: React.FC<BenefitsSectionProps> = ({ wishCare }) => {
  const hasBenefits = wishCare?.benefits && wishCare.benefits.length > 0;
  const hasSuitable = wishCare?.suitableFor && wishCare.suitableFor.length > 0;

  if (!hasBenefits && !hasSuitable) {
    return null;
  }

  return (
    <div className="mb-8 rounded-xl p-4 bg-transparent border-3 border-[#E4EDFD]">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Benefits</h2>
      
      {hasBenefits && (
        <div className="mb-4">
          <ul className="space-y-2">
            {wishCare.benefits.map((benefit, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-2 text-green-600 mt-1">✓</span>
                <span className="text-gray-700">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {hasSuitable && (
        <div>
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Suitable For</h3>
          <ul className="space-y-2">
            {wishCare.suitableFor.map((suitable, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-2 text-green-600 mt-1">•</span>
                <span className="text-gray-700">{suitable}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default BenefitsSection;
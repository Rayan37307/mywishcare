import React from 'react';
import type { WishCareProductData } from '../../types/product';

interface PairsWithSectionProps {
  wishCare?: WishCareProductData;
}

const PairsWithSection: React.FC<PairsWithSectionProps> = ({ wishCare }) => {
  if (!wishCare?.pairsWith) {
    return null;
  }

  return (
    <div className="mb-8 p-6 bg-teal-50 rounded-lg">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Pairs Well With</h2>
      <p className="text-gray-700">{wishCare.pairsWith}</p>
    </div>
  );
};

export default PairsWithSection;
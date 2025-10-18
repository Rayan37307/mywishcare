import React from 'react';
import type { WishCareProductData } from '../../types/product';

interface IngredientsSectionProps {
  wishCare?: WishCareProductData;
}

const IngredientsSection: React.FC<IngredientsSectionProps> = ({ wishCare }) => {
  if (!wishCare?.ingredients) {
    return null;
  }

  return (
    <div className="mb-8 p-6 bg-orange-50 rounded-lg">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Ingredients</h2>
      <p className="text-gray-700 whitespace-pre-line">{wishCare.ingredients}</p>
    </div>
  );
};

export default IngredientsSection;
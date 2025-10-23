import React from 'react';
import type { Product } from '../types/product';
import UniversalProductCard from './UniversalProductCard';

interface PigmentationCardProps {
  products: Product[];
}

const PigmentationCard: React.FC<PigmentationCardProps> = ({ products = [] }) => {
  return (
    <UniversalProductCard 
      products={products} 
      category="pigmentation"
    />
  );
};

export default PigmentationCard;
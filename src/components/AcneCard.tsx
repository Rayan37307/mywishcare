import React from 'react';
import type { Product } from '../types/product';
import UniversalProductCard from './UniversalProductCard';

interface AcneCardProps {
  products: Product[];
}

const AcneCard: React.FC<AcneCardProps> = ({ products = [] }) => {
  return (
    <UniversalProductCard 
      products={products} 
      category="acne"
    />
  );
};

export default AcneCard;
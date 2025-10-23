import React from 'react';
import type { Product } from '../types/product';
import UniversalProductCard from './UniversalProductCard';

interface DullSkinCardProps {
  products: Product[];
}

const DullSkinCard: React.FC<DullSkinCardProps> = ({ products = [] }) => {
  return (
    <UniversalProductCard 
      products={products} 
      category="dullSkin"
    />
  );
};

export default DullSkinCard;
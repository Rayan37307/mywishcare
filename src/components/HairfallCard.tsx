import React from 'react';
import type { Product } from '../types/product';
import UniversalProductCard from './UniversalProductCard';

interface HairfallCardProps {
  products: Product[];
}

const HairfallCard: React.FC<HairfallCardProps> = ({ products = [] }) => {
  return (
    <UniversalProductCard 
      products={products} 
      category="hairfall"
    />
  );
};

export default HairfallCard;
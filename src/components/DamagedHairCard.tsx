import React from 'react';
import type { Product } from '../types/product';
import UniversalProductCard from './UniversalProductCard';

interface DamagedHairCardProps {
  products: Product[];
}

const DamagedHairCard: React.FC<DamagedHairCardProps> = ({ products = [] }) => {
  return (
    <UniversalProductCard 
      products={products} 
      category="damagedHair"
    />
  );
};

export default DamagedHairCard;
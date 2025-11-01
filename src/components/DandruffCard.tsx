import React from 'react';
import type { Product } from '../types/product';
import UniversalProductCard from './UniversalProductCard';

interface DandruffCardProps {
  products: Product[];
}

const DandruffCard: React.FC<DandruffCardProps> = ({ products = [] }) => {
  return (
    <UniversalProductCard 
      products={products} 
      category="dandruff"
    />
  );
};

export default DandruffCard;
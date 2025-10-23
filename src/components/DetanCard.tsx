import React from 'react';
import type { Product } from '../types/product';
import UniversalProductCard from './UniversalProductCard';

interface DetanCardProps {
  products: Product[];
}

const DetanCard: React.FC<DetanCardProps> = ({ products = [] }) => {
  return (
    <UniversalProductCard 
      products={products} 
      category="detan"
    />
  );
};

export default DetanCard;
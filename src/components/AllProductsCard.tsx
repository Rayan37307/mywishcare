import React from 'react';
import type { Product } from '../types/product';
import UniversalProductCard from './UniversalProductCard';

interface AllProductsCardProps {
  products: Product[];
}

const AllProductsCard: React.FC<AllProductsCardProps> = ({ products = [] }) => {
  return (
    <UniversalProductCard 
      products={products} 
      category="allProducts"
    />
  );
};

export default AllProductsCard;
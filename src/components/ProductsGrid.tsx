import type { Product } from '../types/product';
import ProductCard from './ProductCard';

interface ProductsGridProps {
  products: Product[];
  onAddToCart: (product: Product, quantity?: number) => void;
  className?: string;
}

const ProductsGrid: React.FC<ProductsGridProps> = ({ 
  products, 
  onAddToCart, 
  className = 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4' 
}) => {
  return (
    <div className={className}>
      {products.map((product) => (
        <ProductCard 
          key={product.id} 
          product={product} 
          onAddToCart={onAddToCart} 
        />
      ))}
    </div>
  );
};

export default ProductsGrid;
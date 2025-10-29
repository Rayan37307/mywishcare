import type { Product } from '../types/product';
import ProductCard from './ProductCard';
import ProductCardSkeleton from './ProductCardSkeleton';
import NoProductsFound from './NoProductsFound';

interface ProductsGridProps {
  products: Product[];
  onAddToCart: (product: Product, quantity?: number) => void;
  className?: string;
  loading?: boolean;
  skeletonCount?: number;
}

const ProductsGrid: React.FC<ProductsGridProps> = ({ 
  products, 
  onAddToCart, 
  className = 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4',
  loading = false,
  skeletonCount = 8
}) => {
  if (loading) {
    return (
      <div className={className}>
        {Array.from({ length: skeletonCount }, (_, index) => (
          <ProductCardSkeleton key={`skeleton-${index}`} />
        ))}
      </div>
    );
  }

  if (products.length === 0 && !loading) {
    return (
      <div className={className}>
        <div className="col-span-full">
          <NoProductsFound message="No products found" />
        </div>
      </div>
    );
  }

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
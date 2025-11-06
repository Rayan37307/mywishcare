import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../types/product';
import { useProductStore } from '../store/productStore';
import { useCartStore } from '../store/cartStore';
import { ArrowRightIcon } from 'lucide-react';
import Skeleton from './Skeleton';
import NoProductsFound from './NoProductsFound';

const RoutineBuilder = () => {
  const { routineBuilderProducts, loading, error, fetchRoutineBuilderProducts } = useProductStore();
  const { addItem, isAddingItem } = useCartStore();

  const handleAddToCart = (product: Product) => addItem(product, 1);

  useEffect(() => {
    if (!routineBuilderProducts.length) fetchRoutineBuilderProducts();
  }, [routineBuilderProducts.length]);

  // Loading Skeleton
  if (loading && !routineBuilderProducts.length) {
    return (
      <div className="py-8">
        <Header />
        <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide">
          {Array.from({ length: 4 }, (_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Error or No Products
  if ((error || !routineBuilderProducts.length) && !loading) {
    return (
      <div className="py-8">
        <Header />
        {error ? <p className="text-red-500">Error loading products: {error}</p> : <NoProductsFound message="No routine builder products found" />}
      </div>
    );
  }

  // Render Products
  return (
    <div className="py-8">
      <Header />
      <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {routineBuilderProducts.map((product) => (
          <div key={product.id} className="flex-shrink-0 w-[250px]">
            <RoutineBuilderCardItem
              product={product}
              handleAddToCart={handleAddToCart}
              isAddingItem={isAddingItem}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const Header = () => (
  <div className="flex gap-4 items-center mb-6">
    <h2 className="text-3xl font-bold pt-7">Routine Builder</h2>
    <Link to="/product-category/routinebuilder" className="flex gap-2 items-center">
      View All <ArrowRightIcon />
    </Link>
  </div>
);

const SkeletonCard = () => (
  <div className="bg-white rounded-lg overflow-hidden p-2 flex flex-col w-[250px]">
    <Skeleton variant="rectangular" className="w-full aspect-[5/5.5] rounded-lg" />
    <div className="mt-2 flex flex-col gap-2">
      <Skeleton variant="text" className="h-4 w-3/4 mx-auto" />
      <Skeleton variant="text" className="h-3 w-full mx-auto" />
      <Skeleton variant="rectangular" className="w-full h-10 rounded-md" />
    </div>
  </div>
);

interface RoutineBuilderCardItemProps {
  product: Product;
  handleAddToCart: (product: Product) => void;
  isAddingItem: (productId: number) => boolean;
}

const RoutineBuilderCardItem: React.FC<RoutineBuilderCardItemProps> = ({ product, handleAddToCart, isAddingItem }) => {
  const [isHovered, setIsHovered] = useState(false);

  const getDisplayImage = () => {
    if (product.images?.length > 1 && isHovered) return product.images[1]?.src;
    return product.images?.[0]?.src;
  };

  return (
    <Link to={`/products/${product.slug}`} className="block">
       <div
        className="bg-white rounded-lg overflow-hidden p-2 flex flex-col h-[420px] min-w-[250px]" // fixed height
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="w-full aspect-[5/5.5]">
          <img
            src={getDisplayImage()}
            alt={product.name}
            className="w-full h-full object-cover rounded-lg transition-opacity duration-300"
          />
        </div>

        <div className="flex flex-col flex-grow mt-2">
          <h3 className="text-[15px] font-medium line-clamp-2 text-center">{product.name}</h3>
          <p
            className="text-[10px] text-gray-600 mt-1 text-center flex-grow overflow-hidden truncate"
            dangerouslySetInnerHTML={{ __html: product.short_description }}
          />
          <div className="flex justify-center items-center gap-2 mt-2">
            {product.sale_price && product.sale_price !== product.regular_price ? (
              <>
                <p className="text-gray-500 text-sm line-through">৳{product.regular_price}</p>
                <p className="text-black text-base font-semibold">৳{product.sale_price}</p>
              </>
            ) : (
              <p className="text-black font-semibold">৳{product.price}</p>
            )}
          </div>
        </div>

        <button
          className={`w-full py-2 bg-[#D4F871] uppercase rounded-md border border-black text-sm flex justify-center items-center gap-2 mt-2 ${
            isAddingItem(product.id) ? 'opacity-60' : ''
          }`}
          onClick={(e) => {
            e.preventDefault();
            handleAddToCart(product);
          }}
          disabled={isAddingItem(product.id)}
        >
          {isAddingItem(product.id) ? 'Adding...' : 'Add to cart'}
        </button>
      </div>
    </Link>
  );
};

export default RoutineBuilder;

import { useEffect, useState } from 'react';
import type { Product } from '../types/product';
import { Link } from 'react-router-dom';
import { useProductStore } from '../store/productStore';
import { useCartStore } from '../store/cartStore';
import { ArrowRightIcon } from 'lucide-react';
import Skeleton from './Skeleton';
import NoProductsFound from './NoProductsFound';

const BestSellers = () => {
  const { bestSellingProducts, loading, error, fetchBestSellingProducts } = useProductStore();
  const { addItem, isAddingItem } = useCartStore();

  const handleAddToCart = (product: Product) => addItem(product, 1);

  useEffect(() => {
    if (bestSellingProducts.length === 0) fetchBestSellingProducts();
  }, [bestSellingProducts.length]);

  if (loading && bestSellingProducts.length === 0) {
    return (
      <div className="py-8">
        <Header />
        <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error && bestSellingProducts.length === 0)
    return (
      <div className="py-8">
        <Header />
        <p className="text-red-500">Error loading products: {error}</p>
      </div>
    );

  if (!loading && bestSellingProducts.length === 0)
    return (
      <div className="py-8">
        <Header />
        <NoProductsFound message="No best selling products found" />
      </div>
    );

  return (
    <div className="py-8">
      <Header />
      <div className="overflow-x-auto pb-4 scrollbar-hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="flex gap-5 w-max">
          {bestSellingProducts.map((product) => (
            <div key={product.id} className="flex-shrink-0 w-[250px]">
              <BestSellersCardItem
                product={product}
                handleAddToCart={handleAddToCart}
                isAddingItem={isAddingItem}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Header = () => (
  <div className="flex gap-4 items-center mb-6 px-2">
    <h2 className="text-3xl font-bold text-left">Best Sellers</h2>
    <Link to="/collections/bestsellers" className="flex items-center gap-2 text-sm font-medium">
      View All <ArrowRightIcon size={16} />
    </Link>
  </div>
);

const SkeletonCard = () => (
  <div className="bg-white rounded-lg overflow-hidden p-2 w-[250px] flex flex-col">
    <Skeleton variant="rectangular" className="w-full aspect-[5/5.5] rounded-lg" />
    <div className="text-center mt-2">
      <Skeleton variant="text" className="h-4 w-3/4 mx-auto mb-2" />
      <Skeleton variant="text" className="h-3 w-full mx-auto mb-3" />
    </div>
    <Skeleton variant="rectangular" className="w-full h-10 rounded-md mt-auto" />
  </div>
);

interface BestSellersCardItemProps {
  product: Product;
  handleAddToCart: (product: Product) => void;
  isAddingItem: (productId: number) => boolean;
}

const BestSellersCardItem: React.FC<BestSellersCardItemProps> = ({
  product,
  handleAddToCart,
  isAddingItem,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getDisplayImage = () => {
    if (product.images?.length > 1 && isHovered) return product.images[1]?.src;
    return product.images?.[0]?.src;
  };

  return (
    <Link to={`/products/${product.id}`} className="block">
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
            className="text-[10px] text-gray-600 mt-1 text-center flex-grow overflow-hidden"
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



export default BestSellers;

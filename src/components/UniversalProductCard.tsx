import type { Product } from '../types/product';
import { Link } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import NoProductsFound from './NoProductsFound';

export type ProductCategory =
  | 'acne'
  | 'pigmentation'
  | 'hairfall'
  | 'dullSkin'
  | 'detan'
  | 'damagedHair'
  | 'allProducts'
  | 'sunCare'
  | 'bestSellers';

interface UniversalProductCardProps {
  products: Product[];
  category?: ProductCategory;
  className?: string;
}

const UniversalProductCard: React.FC<UniversalProductCardProps> = ({
  products = [],
  category,
  className = "py-8"
}) => {
  const { addItem, getCartItems, isAddingItem } = useCartStore();
  
  const handleAddToCart = (product: Product) => {
    addItem(product, 1);
  };

  // Check if a product is already in the cart
  const isInCart = (productId: number) => {
    return getCartItems().some(item => item.product.id === productId);
  };

  // Check if a product is currently being added to the cart
  const isAddingToCart = (productId: number) => {
    return isAddingItem(productId);
  };

  // Format price with proper number formatting
  const formatPrice = (price: string | number | undefined): string => {
    if (price === undefined) return '0.00';
    if (typeof price === 'number') {
      return price.toString();
    }
    if (typeof price === 'string') {
      // Remove any non-numeric characters except decimal point
      const numericValue = parseFloat(price.replace(/[^\d.]/g, ''));
      if (!isNaN(numericValue)) {
        return numericValue.toFixed(2);
      }
      return '0.00';
    }
    return '0.00';
  };

  // Show "No Products Found" when there are no products
  if (products.length === 0) {
    let message = 'No products found';
    if (category) {
      const categoryMessages: Record<string, string> = {
        acne: 'No acne care products found',
        pigmentation: 'No pigmentation care products found',
        hairfall: 'No hair fall products found',
        dullSkin: 'No dull skin care products found',
        detan: 'No de-tan products found',
        damagedHair: 'No damaged hair care products found',
        sunCare: 'No sun care products found',
        bestSellers: 'No best selling products found',
        allProducts: 'No products found'
      };
      message = categoryMessages[category] || message;
    }
    
    return (
      <div className={className}>
        <NoProductsFound message={message} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
  {products.map((product) => (
    <div
      key={product.id}
      className="bg-white rounded-lg overflow-hidden p-2 flex flex-col"
      style={{ transformOrigin: 'top center' }}
    >
      <Link to={`/products/${product.id}`} className="flex flex-col flex-grow">
        <div className="w-full aspect-[5/5.5]">
          <img
            src={product.images[0]?.src || '/placeholder.webp'}
            alt={product.name}
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
        <div className="text-center flex-grow mt-2">
          <h3 className="text-[15px]">{product.name}</h3>
          <p
            className="text-[10px] text-black truncate"
            dangerouslySetInnerHTML={{ __html: product.short_description }}
          />
          <div className="flex items-center justify-center gap-2 py-2">
            {product.sale_price &&
            product.sale_price !== '' &&
            product.sale_price !== product.regular_price ? (
              <>
                <p className="text-gray-500 text-[11px] line-through mb-1">
                  ₹{formatPrice(product.regular_price)}
                </p>
                <p className="text-gray-800 text-[17px] font-semibold mb-2 mt-1">
                  ₹{formatPrice(product.sale_price)}
                </p>
              </>
            ) : (
              <p className="text-black mb-2 mt-2">₹{formatPrice(product.price)}</p>
            )}
          </div>
        </div>
      </Link>
      <button
        className={`w-full py-2 bg-[#D4F871] uppercase rounded-md border-1 text-sm border-black flex justify-center items-center gap-2 ${
          isAddingToCart(product.id)
            ? 'bg-gray-300 cursor-default'
            : 'bg-[#D4F871] hover:bg-[#c0e05d] transition-colors'
        }`}
        onClick={(e) => {
          e.preventDefault();
          if (!isAddingToCart(product.id)) {
            handleAddToCart(product);
          }
        }}
        disabled={isAddingToCart(product.id)}
      >
        {isAddingToCart(product.id) ? 'Adding...' : 'Add to cart'}
        {!isAddingToCart(product.id) && (
          <span className="mb-[3px]">
            <svg
              aria-hidden="true"
              fill="none"
              focusable="false"
              width="15"
              viewBox="0 0 24 24"
            >
              <path
                d="M4.75 8.25A.75.75 0 0 0 4 9L3 19.125c0 1.418 1.207 2.625 2.625 2.625h12.75c1.418 0 2.625-1.149 2.625-2.566L20 9a.75.75 0 0 0-.75-.75H4.75Zm2.75 0v-1.5a4.5 4.5 0 0 1 4.5-4.5v0a4.5 4.5 0 0 1 4.5 4.5v1.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
            </svg>
          </span>
        )}
      </button>
    </div>
  ))}
</div>

  );
};

export default UniversalProductCard;

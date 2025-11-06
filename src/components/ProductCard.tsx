import { Link } from 'react-router-dom';
import { APP_CONSTANTS } from '../constants/app';
import { formatCurrency } from '../utils/priceUtils';
import { isOnSale, getSavingsAmount, getSavingsPercentage } from '../utils/productUtils';
import type { Product } from '../types/product';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, quantity?: number) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const [isHovered, setIsHovered] = useState(false);
  const onSale = isOnSale(product);
  const savingsAmount = getSavingsAmount(product);
  const savingsPercentage = getSavingsPercentage(product);

  // Get the image to show based on hover state
  const getDisplayImage = () => {
    if (product.images && product.images.length > 1 && isHovered) {
      // Show the second image (index 1) if hovered and more than one image exists
      return product.images[1]?.src || product.images[0]?.src || APP_CONSTANTS.DEFAULT_PRODUCT_IMAGE;
    }
    // Show the first image by default
    return product.images[0]?.src || APP_CONSTANTS.DEFAULT_PRODUCT_IMAGE;
  };

  return (
    <div 
      className="bg-white rounded-lg overflow-hidden p-2 flex flex-col transition-all h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/products/${product.slug}`}>
        <div className="w-full aspect-[5/5.5] relative">
          <img 
            src={getDisplayImage()} 
            alt={product.name} 
            className="w-full h-full object-cover rounded-lg transition-opacity duration-300"
          />
        </div>
        
        <div className="text-center flex-grow mt-2">
          <h3 className="text-[15px]">{product.name}</h3>
          <p 
            className="text-[10px] text-black truncate" 
            dangerouslySetInnerHTML={{ __html: product.short_description }} 
          />
          
          <div className="flex items-center justify-center gap-2 py-2">
            {onSale ? (
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-[13px] leading-[20px] line-through mb-1">
                    {formatCurrency(parseFloat(product.regular_price || '0'))}
                  </span>
                  <span className="text-gray-800 text-lg mb-2 mt-1">
                    {formatCurrency(parseFloat(product.sale_price || '0'))}
                  </span>
                </div>
                <span className="text-xs text-green-600">
                  Save {formatCurrency(savingsAmount)} ({savingsPercentage}%)
                </span>
              </div>
            ) : (
              <p className="text-black mb-2 mt-2">
                {formatCurrency(parseFloat(product.price.toString()))}
              </p>
            )}
          </div>
        </div>
      </Link>
      
      {/* Check if product is out of stock */}
      {(() => {
        const isOutOfStock = product.stock_status === 'outofstock';
        
        return (
          <button
            className={`w-full py-2 uppercase rounded-md border-1 text-sm border-black flex justify-center items-center gap-2 ${
              isOutOfStock
                ? 'bg-gray-300 text-gray-500 border-gray-400 cursor-not-allowed'
                : 'bg-[#D4F871] hover:bg-[#c0e05d] transition-colors'
            }`}
            onClick={(e) => {
              e.preventDefault();
              if (!isOutOfStock) {
                onAddToCart(product, 1);
              }
            }}
            disabled={isOutOfStock}
          >
            {isOutOfStock ? 'Out of Stock' : 'Add to cart'}
            {!isOutOfStock && (
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
                  />
                </svg>
              </span>
            )}
          </button>
        );
      })()}
    </div>
  );
};

export default ProductCard;
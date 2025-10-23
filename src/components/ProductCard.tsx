import React from 'react';
import type { Product } from '../types/product';
import { Link } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';

interface ProductCardProps {
  products: Product[];
}

const ProductCard: React.FC<ProductCardProps> = ({ products = [] }) => {
  const { addItem } = useCartStore();
  
  const handleAddToCart = (product: Product) => {
    addItem(product, 1);
  };

  return (
    <div className="py-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-lg overflow-hidden p-2 flex flex-col transition-all h-full">
            <Link to={`/products/${product.id}`}>
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
                  className="text-[10px] text-black"
                  dangerouslySetInnerHTML={{ __html: product.short_description }}
                />
                <div className="flex items-center justify-center gap-2 py-2">
                  {product.sale_price && product.sale_price !== '' && product.sale_price !== product.regular_price ? (
                    <>
                      <p className="text-gray-500 text-[13px] leading-[20px] line-through mb-1">₹{product.regular_price}</p>
                      <p className="text-gray-800 text-lg mb-2 mt-1">₹{product.sale_price}</p>
                    </>
                  ) : (
                    <p className="text-black mb-2 mt-2">₹{product.price}</p>
                  )}
                </div>
              </div>
            </Link>
            <button 
              className="w-full py-2 bg-[#D4F871] uppercase rounded-md border-1 text-sm border-black flex justify-center items-center gap-2"
              onClick={(e) => {
                e.preventDefault();
                handleAddToCart(product);
              }}
            >
              Add to cart
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
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductCard;
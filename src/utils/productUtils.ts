import type { Product } from '../types/product';

// Product utilities
export const getProductPrice = (product: Product): number => {
  if (product.sale_price && product.sale_price !== '' && product.sale_price !== product.regular_price) {
    return parseFloat(product.sale_price.replace(/[^\d.-]/g, '')) || 0;
  }
  return parseFloat(product.price.toString().replace(/[^\d.-]/g, '')) || 0;
};

export const getOriginalPrice = (product: Product): number => {
  if (product.sale_price && product.sale_price !== '' && product.sale_price !== product.regular_price) {
    return parseFloat(product.regular_price.replace(/[^\d.-]/g, '')) || 0;
  }
  return 0; // No original price if there's no sale
};

export const isOnSale = (product: Product): boolean => {
  return (
    product.sale_price && 
    product.sale_price !== '' && 
    product.sale_price !== product.regular_price &&
    parseFloat(product.sale_price.replace(/[^\d.-]/g, '') || '0') < 
    parseFloat(product.regular_price.replace(/[^\d.-]/g, '') || '0')
  );
};

// Calculate savings amount
export const getSavingsAmount = (product: Product): number => {
  if (!isOnSale(product)) return 0;
  
  const originalPrice = getOriginalPrice(product);
  const currentPrice = getProductPrice(product);
  return originalPrice - currentPrice;
};

// Calculate savings percentage
export const getSavingsPercentage = (product: Product): number => {
  if (!isOnSale(product)) return 0;
  
  const originalPrice = getOriginalPrice(product);
  if (originalPrice === 0) return 0;
  
  const savings = getSavingsAmount(product);
  return Math.round((savings / originalPrice) * 100);
};
// Price formatting utility
export const formatPrice = (price: string | number): string => {
  if (typeof price === 'number') {
    return price.toFixed(2);
  }
  
  // Remove any non-numeric characters except decimal point
  const numericPrice = price.replace(/[^\d.-]/g, '');
  const parsedPrice = parseFloat(numericPrice);
  return isNaN(parsedPrice) ? '0.00' : parsedPrice.toFixed(2);
};

// Format currency with symbol
export const formatCurrency = (price: string | number, currency = '₹'): string => {
  return `${currency}${formatPrice(price)}`;
};

// Parse price string to number
export const parsePrice = (price: string | number): number => {
  if (typeof price === 'number') {
    return price;
  }
  
  const numericPrice = price.replace(/[^\d.-]/g, '');
  const parsedPrice = parseFloat(numericPrice);
  return isNaN(parsedPrice) ? 0 : parsedPrice;
};
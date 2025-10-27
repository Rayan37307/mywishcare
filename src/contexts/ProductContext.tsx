// Product Context to manage product operations globally
import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useProductOperations } from '../hooks/useProductOperations';
import type { Product } from '../types/product';

interface ProductContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  fetchProductById: (id: number) => Promise<Product | null>;
  searchProducts: (query: string) => Promise<Product[]>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

interface ProductProviderProps {
  children: ReactNode;
}

export const ProductProvider: React.FC<ProductProviderProps> = ({ children }) => {
  const {
    fetchAllProducts,
    fetchProductById,
    searchProducts,
    loading,
    error,
    getProductsByCollection
  } = useProductOperations();

  const products = getProductsByCollection('allProducts');

  const fetchProducts = async () => {
    await fetchAllProducts();
  };

  return (
    <ProductContext.Provider value={{
      products,
      loading,
      error,
      fetchProducts,
      fetchProductById,
      searchProducts
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProductContext = (): ProductContextType => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProductContext must be used within a ProductProvider');
  }
  return context;
};
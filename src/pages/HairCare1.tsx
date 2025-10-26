import { useEffect } from 'react'
import ProblemCategory from '../components/ProblemCategory';
import ProductsGrid from '../components/ProductsGrid';
import { useProductOperations } from '../hooks/useProductOperations';
import { useCartOperations } from '../hooks/useCartOperations';

const HairCare1 = () => {
  const { 
    fetchBestSellingProducts, 
    loading, 
    getProductsByCollection 
  } = useProductOperations();
  
  const { addToCart } = useCartOperations();
  
  const bestSellingProducts = getProductsByCollection('bestSellers');

  useEffect(() => {
    fetchBestSellingProducts();
  }, [fetchBestSellingProducts]);

  return (
    <div className='px-10'>
      <ProblemCategory />
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <ProductsGrid products={bestSellingProducts} onAddToCart={addToCart} />
      )}
    </div>
  );
};

export default HairCare1;
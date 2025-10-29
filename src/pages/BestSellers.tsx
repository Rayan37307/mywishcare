import { useEffect } from 'react';
import ProblemCategory from '../components/ProblemCategory';
import UniversalProductCard from '../components/UniversalProductCard';
import { useProductStore } from '../store/productStore';

const BestSellers = () => {
  const { 
    fetchBestSellingProducts, 
    bestSellingProducts,
    loading
  } = useProductStore();
  
  useEffect(() => {
    fetchBestSellingProducts();
  }, [fetchBestSellingProducts]);

  return (
    <div className='px-10'>
      <ProblemCategory />
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <UniversalProductCard products={bestSellingProducts} />
      )}
    </div>
  );
};

export default BestSellers;

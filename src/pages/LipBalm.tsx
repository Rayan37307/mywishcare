import { useEffect } from 'react'
import ProblemCategory from '../components/ProblemCategory';
import BestSellersCard from '../components/BestSellersCards';
import { useProductOperations } from '../hooks/useProductOperations';

const LipBalm = () => {
  const { 
    fetchBestSellingProducts, 
    loading, 
    getProductsByCollection 
  } = useProductOperations();
  
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
        <BestSellersCard products={bestSellingProducts} />
      )}
    </div>
  );
};

export default LipBalm;
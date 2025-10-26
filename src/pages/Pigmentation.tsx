import { useEffect } from 'react'
import ProblemCategory from '../components/ProblemCategory';
import PigmentationCard from '../components/PigmentationCard';
import { useProductOperations } from '../hooks/useProductOperations';

const Pigmentation = () => {
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
        <PigmentationCard products={bestSellingProducts} />
      )}
    </div>
  );
};

export default Pigmentation;

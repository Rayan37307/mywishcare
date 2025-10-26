import { useEffect } from 'react';
import ProblemCategory from '../components/ProblemCategory';
import AcneCard from '../components/AcneCard';
import { useProductOperations } from '../hooks/useProductOperations';

const Acne = () => {
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
        <AcneCard products={bestSellingProducts} />
      )}
    </div>
  );
};

export default Acne;

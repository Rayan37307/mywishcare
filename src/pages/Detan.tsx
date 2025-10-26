import { useEffect } from 'react';
import ProblemCategory from '../components/ProblemCategory';
import DetanCard from '../components/DetanCard';
import { useProductOperations } from '../hooks/useProductOperations';

const Detan = () => {
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
        <DetanCard products={bestSellingProducts} />
      )}
    </div>
  );
};

export default Detan;

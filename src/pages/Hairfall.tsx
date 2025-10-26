import { useEffect } from 'react'
import ProblemCategory from '../components/ProblemCategory';
import HairfallCard from '../components/HairfallCard';
import { useProductOperations } from '../hooks/useProductOperations';

const Hairfall = () => {
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
        <HairfallCard products={bestSellingProducts} />
      )}
    </div>
  );
};

export default Hairfall;

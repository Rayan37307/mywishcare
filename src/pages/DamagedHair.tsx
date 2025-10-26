import { useEffect } from 'react';
import ProblemCategory from '../components/ProblemCategory';
import DamagedHairCard from '../components/DamagedHairCard';
import { useProductOperations } from '../hooks/useProductOperations';

const DamagedHair = () => {
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
        <DamagedHairCard products={bestSellingProducts} />
      )}
    </div>
  );
};

export default DamagedHair;

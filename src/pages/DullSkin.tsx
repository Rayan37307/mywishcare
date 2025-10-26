import { useEffect } from 'react';
import ProblemCategory from '../components/ProblemCategory';
import DullSkinCard from '../components/DullSkinCard';
import { useProductOperations } from '../hooks/useProductOperations';

const DullSkin = () => {
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
        <DullSkinCard products={bestSellingProducts} />
      )}
    </div>
  );
};

export default DullSkin;

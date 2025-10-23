import { useEffect } from 'react'
import ProblemCategory from '../components/ProblemCategory';
import PigmentationCard from '../components/PigmentationCard';
import { useProductStore } from '../store/productStore';

const Pigmentation = () => {
  const { bestSellingProducts, fetchBestSellingProducts, loading } = useProductStore();

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

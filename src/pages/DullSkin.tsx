import { useEffect } from 'react';
import ProblemCategory from '../components/ProblemCategory';
import DullSkinCard from '../components/DullSkinCard';
import { useProductStore } from '../store/productStore';

const DullSkin = () => {
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
        <DullSkinCard products={bestSellingProducts} />
      )}
    </div>
  );
};

export default DullSkin;

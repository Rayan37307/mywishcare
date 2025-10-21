import React, { useEffect } from 'react';
import ProblemCategory from '../components/ProblemCategory';
import AcneCard from '../components/AcneCard';
import { useProductStore } from '../store/productStore';

const Acne = () => {
  const { bestSellingProducts, fetchBestSellingProducts, loading } = useProductStore();

  useEffect(() => {
    fetchBestSellingProducts();
  }, [fetchBestSellingProducts]);

  return (
    <div className='px-20'>
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
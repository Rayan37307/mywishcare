import React, { useEffect } from 'react';
import ProblemCategory from '../components/ProblemCategory';
import DamagedHairCard from '../components/DamagedHairCard';
import { useProductStore } from '../store/productStore';

const DamagedHair = () => {
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
        <DamagedHairCard products={bestSellingProducts} />
      )}
    </div>
  );
};

export default DamagedHair;
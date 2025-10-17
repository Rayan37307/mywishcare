import React, { useEffect } from 'react';
import ProblemCategory from '../components/ProblemCategory';
import BestSellersCard from '../components/BestSellersCards';
import { useProductStore } from '../store/productStore';

const BestSellers = () => {
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
        <BestSellersCard products={bestSellingProducts} />
      )}
    </div>
  );
};

export default BestSellers;
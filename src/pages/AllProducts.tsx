import React, { useEffect } from 'react';
import ProblemCategory from '../components/ProblemCategory';
import AllProductsCard from '../components/AllProductsCard';
import { useProductStore } from '../store/productStore';

const AllProducts = () => {
  const { products, fetchAllProducts, loading } = useProductStore();

  useEffect(() => {
    fetchAllProducts();
  }, [fetchAllProducts]);

  return (
    <div className='px-10'>
      <ProblemCategory />
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <AllProductsCard products={products} />
      )}
    </div>
  );
};

export default AllProducts;

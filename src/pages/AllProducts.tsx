import { useEffect } from 'react';
import ProblemCategory from '../components/ProblemCategory';
import AllProductsCard from '../components/AllProductsCard';
import AllProductsCardSkeleton from '../components/AllProductsCardSkeleton';
import { useProductStore } from '../store/productStore';

const AllProducts = () => {
  const { allProducts, fetchAllProductsCollection, loading } = useProductStore();

  useEffect(() => {
    fetchAllProductsCollection();
  }, [fetchAllProductsCollection]);

  return (
    <div className=' md:px-10 max-md:px-4'>
      <ProblemCategory />
      {loading ? (
        <AllProductsCardSkeleton count={8} />
      ) : (
        <AllProductsCard products={allProducts} />
      )}
    </div>
  );
};

export default AllProducts;

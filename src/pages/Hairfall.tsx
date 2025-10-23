import { useEffect } from 'react'
import ProblemCategory from '../components/ProblemCategory';
import HairfallCard from '../components/HairfallCard';
import { useProductStore } from '../store/productStore';

const Hairfall = () => {
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
        <HairfallCard products={bestSellingProducts} />
      )}
    </div>
  );
};

export default Hairfall;

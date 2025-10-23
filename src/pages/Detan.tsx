import { useEffect } from 'react';
import ProblemCategory from '../components/ProblemCategory';
import DetanCard from '../components/DetanCard';
import { useProductStore } from '../store/productStore';

const Detan = () => {
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
        <DetanCard products={bestSellingProducts} />
      )}
    </div>
  );
};

export default Detan;

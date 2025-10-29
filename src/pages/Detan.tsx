import { useEffect } from 'react';
import ProblemCategory from '../components/ProblemCategory';
import DetanCard from '../components/DetanCard';
import { useProductStore } from '../store/productStore';

const Detan = () => {
  const { 
    fetchDetanProducts, 
    detanProducts,
    loading
  } = useProductStore();
  
  useEffect(() => {
    fetchDetanProducts();
  }, [fetchDetanProducts]);

  return (
    <div className='px-10'>
      <ProblemCategory />
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <DetanCard products={detanProducts} />
      )}
    </div>
  );
};

export default Detan;

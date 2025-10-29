import { useEffect } from 'react';
import ProblemCategory from '../components/ProblemCategory';
import AcneCard from '../components/AcneCard';
import { useProductStore } from '../store/productStore';

const Acne = () => {
  const { 
    fetchAcneProducts, 
    acneProducts,
    loading
  } = useProductStore();
  
  useEffect(() => {
    fetchAcneProducts();
  }, [fetchAcneProducts]);

  return (
    <div className='px-10'>
      <ProblemCategory />
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <AcneCard products={acneProducts} />
      )}
    </div>
  );
};

export default Acne;

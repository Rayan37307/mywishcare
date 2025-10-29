import { useEffect } from 'react';
import ProblemCategory from '../components/ProblemCategory';
import DamagedHairCard from '../components/DamagedHairCard';
import { useProductStore } from '../store/productStore';

const DamagedHair = () => {
  const { 
    fetchDamagedHairProducts, 
    damagedHairProducts,
    loading
  } = useProductStore();
  
  useEffect(() => {
    fetchDamagedHairProducts();
  }, [fetchDamagedHairProducts]);

  return (
    <div className='px-10'>
      <ProblemCategory />
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <DamagedHairCard products={damagedHairProducts} />
      )}
    </div>
  );
};

export default DamagedHair;

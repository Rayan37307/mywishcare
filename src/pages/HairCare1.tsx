import { useEffect } from 'react'
import ProblemCategory from '../components/ProblemCategory';
import UniversalProductCard from '../components/UniversalProductCard';
import { useProductStore } from '../store/productStore';

const HairCare1 = () => {
  const { 
    fetchHairCare1Products, 
    hairCare1Products,
    loading
  } = useProductStore();

  useEffect(() => {
    fetchHairCare1Products();
  }, [fetchHairCare1Products]);

  return (
    <div className='px-10'>
      <ProblemCategory />
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <UniversalProductCard products={hairCare1Products} />
      )}
    </div>
  );
};

export default HairCare1;
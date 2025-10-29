import { useEffect } from 'react'
import ProblemCategory from '../components/ProblemCategory';
import UniversalProductCard from '../components/UniversalProductCard';
import { useProductStore } from '../store/productStore';

const SunCare = () => {
  const { 
    fetchSunCareProducts, 
    sunCareProducts,
    loading
  } = useProductStore();
  
  useEffect(() => {
    fetchSunCareProducts();
  }, [fetchSunCareProducts]);

  return (
    <div className='px-10'>
      <ProblemCategory />
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <UniversalProductCard products={sunCareProducts} />
      )}
    </div>
  );
};

export default SunCare;

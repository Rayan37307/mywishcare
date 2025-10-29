import { useEffect } from 'react'
import ProblemCategory from '../components/ProblemCategory';
import HairfallCard from '../components/HairfallCard';
import { useProductStore } from '../store/productStore';

const Hairfall = () => {
  const { 
    fetchHairfallProducts, 
    hairfallProducts,
    loading
  } = useProductStore();
  
  useEffect(() => {
    fetchHairfallProducts();
  }, [fetchHairfallProducts]);

  return (
    <div className='px-10'>
      <ProblemCategory />
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <HairfallCard products={hairfallProducts} />
      )}
    </div>
  );
};

export default Hairfall;

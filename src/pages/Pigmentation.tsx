import { useEffect } from 'react'
import ProblemCategory from '../components/ProblemCategory';
import PigmentationCard from '../components/PigmentationCard';
import { useProductStore } from '../store/productStore';

const Pigmentation = () => {
  const { 
    fetchPigmentationProducts, 
    pigmentationProducts,
    loading
  } = useProductStore();
  
  useEffect(() => {
    fetchPigmentationProducts();
  }, [fetchPigmentationProducts]);

  return (
    <div className='px-10'>
      <ProblemCategory />
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <PigmentationCard products={pigmentationProducts} />
      )}
    </div>
  );
};

export default Pigmentation;

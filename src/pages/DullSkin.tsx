import { useEffect } from 'react';
import ProblemCategory from '../components/ProblemCategory';
import DullSkinCard from '../components/DullSkinCard';
import { useProductStore } from '../store/productStore';

const DullSkin = () => {
  const { 
    fetchDullSkinProducts, 
    dullSkinProducts,
    loading
  } = useProductStore();
  
  useEffect(() => {
    fetchDullSkinProducts();
  }, [fetchDullSkinProducts]);

  return (
    <div className='px-10'>
      <ProblemCategory />
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <DullSkinCard products={dullSkinProducts} />
      )}
    </div>
  );
};

export default DullSkin;

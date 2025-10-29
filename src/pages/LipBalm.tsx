import { useEffect } from 'react'
import ProblemCategory from '../components/ProblemCategory';
import UniversalProductCard from '../components/UniversalProductCard';
import { useProductStore } from '../store/productStore';

const LipBalm = () => {
  const { 
    fetchLipBalmProducts, 
    lipBalmProducts,
    loading
  } = useProductStore();
  
  useEffect(() => {
    fetchLipBalmProducts();
  }, [fetchLipBalmProducts]);

  return (
    <div className='px-10'>
      <ProblemCategory />
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <UniversalProductCard products={lipBalmProducts} />
      )}
    </div>
  );
};

export default LipBalm;
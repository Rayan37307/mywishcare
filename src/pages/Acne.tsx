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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg overflow-hidden p-2">
              <div className="animate-pulse bg-gray-200 aspect-[5/5.5] rounded-lg w-full" />
              <div className="text-center mt-2">
                <div className="animate-pulse bg-gray-200 h-4 w-3/4 mx-auto mb-2 rounded" />
                <div className="animate-pulse bg-gray-200 h-3 w-full mx-auto mb-3 rounded" />
                <div className="animate-pulse bg-gray-200 h-8 w-full rounded-md mb-2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <AcneCard products={acneProducts} />
      )}
    </div>
  );
};

export default Acne;

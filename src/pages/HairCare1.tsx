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
        <UniversalProductCard products={hairCare1Products} />
      )}
    </div>
  );
};

export default HairCare1;
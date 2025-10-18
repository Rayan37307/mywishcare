import React from 'react';
import type { WishCareProductData } from '../../types/product';

interface HowToUseSectionProps {
  wishCare?: WishCareProductData;
  getImageUrlFromId: (id: number) => Promise<string | null>;
}

const HowToUseSection: React.FC<HowToUseSectionProps> = ({ 
  wishCare, 
  getImageUrlFromId 
}) => {
  const [imageUrls, setImageUrls] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchImages = async () => {
      if (wishCare?.howToImages && wishCare.howToImages.length > 0) {
        const urls = await Promise.all(
          wishCare.howToImages.map(async (id) => {
            try {
              return await getImageUrlFromId(id);
            } catch (error) {
              console.error('Error fetching image URL:', error);
              return null;
            }
          })
        );
        setImageUrls(urls.filter((url): url is string => url !== null));
      }
      setLoading(false);
    };

    fetchImages();
  }, [wishCare, getImageUrlFromId]);

  if (!wishCare?.howToUse && (!wishCare?.howToImages || wishCare.howToImages.length === 0)) {
    return null;
  }

  return (
    <div className="mb-8 p-6 bg-indigo-50 rounded-lg">
      <h2 className="text-xl font-bold mb-4 text-gray-800">How to Use</h2>
      {wishCare.howToUse && (
        <p className="text-gray-700 mb-4">{wishCare.howToUse}</p>
      )}
      {imageUrls.length > 0 && (
        <div className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {imageUrls.map((url, index) => (
              <div key={index} className="overflow-hidden rounded-lg">
                <img 
                  src={url} 
                  alt={`How to use ${index + 1}`} 
                  className="w-full h-auto object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HowToUseSection;
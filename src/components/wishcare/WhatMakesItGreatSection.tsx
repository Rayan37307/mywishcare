import React from 'react';
import type { WishCareProductData } from '../../types/product';

interface WhatMakesItGreatSectionProps {
  wishCare?: WishCareProductData;
  getImageUrlFromId: (id: number) => Promise<string | null>;
}

const WhatMakesItGreatSection: React.FC<WhatMakesItGreatSectionProps> = ({ 
  wishCare, 
  getImageUrlFromId 
}) => {
  const [imageUrls, setImageUrls] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchImages = async () => {
      if (wishCare?.whatMakesImages && wishCare.whatMakesImages.length > 0) {
        const urls = await Promise.all(
          wishCare.whatMakesImages.map(async (id) => {
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

  if (!wishCare?.whatMakesItGreat && (!wishCare?.whatMakesImages || wishCare.whatMakesImages.length === 0)) {
    return null;
  }

  return (
    <div className="mb-8 p-6 bg-yellow-50 rounded-lg">
      <h2 className="text-xl font-bold mb-4 text-gray-800">What Makes It Great</h2>
      {wishCare.whatMakesItGreat && (
        <p className="text-gray-700 mb-4">{wishCare.whatMakesItGreat}</p>
      )}
      {imageUrls.length > 0 && (
        <div className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {imageUrls.map((url, index) => (
              <div key={index} className="overflow-hidden rounded-lg">
                <img 
                  src={url} 
                  alt={`What makes it great ${index + 1}`} 
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

export default WhatMakesItGreatSection;
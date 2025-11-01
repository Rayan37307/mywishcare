import React, { useRef, useState, useEffect } from 'react';
import type { WishCareProductData } from '../../types/product';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface IngredientsSectionProps {
  wishCare?: WishCareProductData;
  getImageUrlFromId: (id: number) => Promise<string | null>;
}

const IngredientsSection: React.FC<IngredientsSectionProps> = ({ wishCare, getImageUrlFromId }) => {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [showFullText, setShowFullText] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const fetchImages = async () => {
      if (wishCare?.ingredientsImages?.length) {
        const urls = await Promise.all(
          wishCare.ingredientsImages.map(async (id) => {
            try {
              return await getImageUrlFromId(id);
            } catch {
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

  // Detect if text overflows
  useEffect(() => {
    if (textRef.current) {
      const el = textRef.current;
      if (el.scrollHeight > el.clientHeight) setShowButton(true);
    }
  }, [loading, showFullText]);

  if (!wishCare?.ingredients && (!wishCare?.ingredientsImages || wishCare.ingredientsImages.length === 0)) {
    return null;
  }

  if (loading) return <div className="mb-8 p-6 rounded-lg">Loading...</div>;

  return (
    <div className="mb-8 p-6 rounded-lg bg-transparent border-3 border-[#EBE4FD]">
      {/* Header + Toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center text-left"
      >
        <h2 className="text-xl font-bold text-gray-800">Ingredients</h2>
        {open ? (
          <ChevronUp className="text-white transition-transform bg-black p-1 rounded-full" />
        ) : (
          <ChevronDown className="text-white transition-transform bg-black p-1 rounded-full" />
        )}
      </button>

      {/* Content */}
      <div className={`transition-all duration-500 overflow-hidden ${open ? 'max-h-[1000px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
        {/* Ingredients Text */}
        {wishCare.ingredients && (
          <div className="mb-6 relative">
            <p
              ref={textRef}
              className={`text-gray-700 whitespace-pre-line transition-all duration-300 ${!showFullText ? 'line-clamp-3' : ''}`}
            >
              {wishCare.ingredients}
            </p>
            {showButton && (
              <button
                onClick={() => setShowFullText(!showFullText)}
                className="mt-2 text-sm text-blue-600 font-medium hover:underline"
              >
                {showFullText ? 'Show Less' : 'Show More'}
              </button>
            )}
          </div>
        )}

        {/* Horizontal Scroll Image Gallery */}
        {imageUrls.length > 0 && (
          <div className="overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
            <div className="flex gap-6 snap-x snap-mandatory scroll-smooth pb-2">
              {imageUrls.map((url, index) => (
                <div key={index} className="w-96 snap-start overflow-hidden flex-shrink-0">
                  <img src={url} alt={`Ingredient ${index + 1}`} className="w-full h-auto object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IngredientsSection;

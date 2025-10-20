import React from 'react';
import type { WishCareProductData } from '../../types/product';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface IngredientsSectionProps {
  wishCare?: WishCareProductData;
  getImageUrlFromId: (id: number) => Promise<string | null>;
}

const IngredientsSection: React.FC<IngredientsSectionProps> = ({
  wishCare,
  getImageUrlFromId,
}) => {
  const [imageUrls, setImageUrls] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [open, setOpen] = React.useState(true);

  React.useEffect(() => {
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

  if (
    !wishCare?.ingredients &&
    (!wishCare?.ingredientsImages || wishCare.ingredientsImages.length === 0)
  ) {
    return null;
  }

  if (loading) return <div className="mb-8 p-6  rounded-lg">Loading...</div>;

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
      <div
        className={`transition-all duration-500 overflow-hidden ${
          open ? 'max-h-[1000px] opacity-100 mt-4' : 'max-h-0 opacity-0'
        }`}
      >
        {/* Ingredients Text */}
        {wishCare.ingredients && (
          <p className="text-gray-700 mb-6 whitespace-pre-line">{wishCare.ingredients}</p>
        )}

        {/* Horizontal Scroll Image Gallery */}
        {imageUrls.length > 0 && (
          <div className="overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
            <div className="flex gap-6 snap-x snap-mandatory scroll-smooth pb-2">
              {imageUrls.map((url, index) => (
                <div
                  key={index}
                  className="w-96 snap-start overflow-hidden flex-shrink-0"
                >
                  <img
                    src={url}
                    alt={`Ingredient ${index + 1}`}
                    className="w-full h-auto object-cover"
                  />
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

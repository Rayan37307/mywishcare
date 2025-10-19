import React from 'react';
import type { WishCareProductData } from '../../types/product';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ResultsSectionProps {
  wishCare?: WishCareProductData;
  getImageUrlFromId: (id: number) => Promise<string | null>;
}

const ResultsSection: React.FC<ResultsSectionProps> = ({
  wishCare,
  getImageUrlFromId,
}) => {
  const [imageUrls, setImageUrls] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [open, setOpen] = React.useState(true);

  React.useEffect(() => {
    const fetchImages = async () => {
      if (wishCare?.resultsImages?.length) {
        const urls = await Promise.all(
          wishCare.resultsImages.map(async (id) => {
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

  if (loading) return null;
  if (!wishCare?.results && imageUrls.length === 0) return null;

  return (
    <div className="mb-8 p-6 bg-transparent rounded-lg border border-gray-300">
      {/* Header + Toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center text-left"
      >
        <h2 className="text-xl font-bold text-gray-800">Results</h2>
        {open ? (
          <ChevronUp className="text-gray-600 transition-transform" />
        ) : (
          <ChevronDown className="text-gray-600 transition-transform" />
        )}
      </button>

      {/* Content Section */}
      <div
        className={`transition-all duration-500 overflow-hidden ${
          open ? 'max-h-[1000px] opacity-100 mt-4' : 'max-h-0 opacity-0'
        }`}
      >
        {/* Text */}
        {wishCare.results && (
          <p className="text-gray-700 mb-6 whitespace-pre-line">{wishCare.results}</p>
        )}

        {/* 🔥 Horizontal scroll image gallery */}
        {imageUrls.length > 0 && (
          <div className="overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
            <div className="flex gap-6 snap-x snap-mandatory scroll-smooth pb-2">
              {imageUrls.map((url, index) => (
                <div
                  key={index}
                  className="w-96 snap-start overflow-hidden rounded-xl flex-shrink-0"
                >
                  <img
                    src={url}
                    alt={`Result ${index + 1}`}
                    className="w-full h-auto object-cover rounded-lg transition-transform duration-300 hover:scale-[1.03]"
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

export default ResultsSection;

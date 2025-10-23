import React, { useState, useEffect } from "react";
import type { WishCareProductData } from "../../types/product";
import { ChevronDown, ChevronUp } from "lucide-react";

interface WhatMakesItGreatSectionProps {
  wishCare?: WishCareProductData;
  getImageUrlFromId: (id: number) => Promise<string | null>;
}

const WhatMakesItGreatSection: React.FC<WhatMakesItGreatSectionProps> = ({
  wishCare,
  getImageUrlFromId,
}) => {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      if (wishCare?.whatMakesImages?.length) {
        const urls = await Promise.all(
          wishCare.whatMakesImages.map(async (id) => {
            try {
              return await getImageUrlFromId(id);
            } catch (error) {
              console.error("Error fetching image URL:", error);
              return null;
            }
          })
        );
        setImageUrls(urls.filter((url): url is string => url !== null));
      }
    };

    fetchImages();
  }, [wishCare, getImageUrlFromId]);

  if (
    !wishCare?.whatMakesItGreat &&
    (!wishCare?.whatMakesImages || wishCare.whatMakesImages.length === 0)
  ) {
    return null;
  }

  return (
    <div className="mb-8 p-6 bg-transparent border-[#EBE4FD] rounded-lg border-3">
      {/* Header + Toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center text-left"
      >
        <h2 className="text-xl font-bold text-gray-800">What Makes It Great</h2>
        {open ? (
          <ChevronUp className="text-white transition-transform bg-black p-1 rounded-full" />
        ) : (
          <ChevronDown className="text-white transition-transform bg-black p-1 rounded-full" />
        )}
      </button>

      {/* Content Section */}
      <div
        className={`transition-all duration-500 overflow-hidden ${
          open ? "max-h-[1000px] opacity-100 mt-4" : "max-h-0 opacity-0"
        }`}
      >
        {wishCare.whatMakesItGreat && (
          <p className="text-gray-700 mb-6">{wishCare.whatMakesItGreat}</p>
        )}

        {/* 🔥 Horizontal scroll slider */}
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
                    alt={`What makes it great ${index + 1}`}
                    className="w-full h-auto object-cover transition-transform duration-300"
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

export default WhatMakesItGreatSection;

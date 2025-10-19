import React, { useState, useEffect, useRef } from 'react';
import type { WishCareProductData } from '../../types/product';
import './WhatMakesItGreatSection.css';

interface IngredientsSectionProps {
  wishCare?: WishCareProductData;
  getImageUrlFromId: (id: number) => Promise<string | null>;
}

const IngredientsSection: React.FC<IngredientsSectionProps> = ({ wishCare, getImageUrlFromId }) => {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  // fetch images
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
        setImageUrls(urls.filter((url): url is string => !!url));
      }
      setLoading(false);
    };
    fetchImages();
  }, [wishCare, getImageUrlFromId]);

  // auto slide
  useEffect(() => {
    if (imageUrls.length === 0) return;
    const interval = setInterval(() => {
      if (!isScrolling) setCurrentIndex(prev => (prev + 1) % imageUrls.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isScrolling, imageUrls.length]);

  // slider helpers
  const goToSlide = (index: number) => setCurrentIndex(index);
  const goToNextSlide = () => setCurrentIndex(prev => (prev === imageUrls.length - 1 ? 0 : prev + 1));
  const goToPrevSlide = () => setCurrentIndex(prev => (prev === 0 ? imageUrls.length - 1 : prev - 1));

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setStartX(clientX);
    setStartY(clientY);
    if (sliderRef.current) sliderRef.current.style.cursor = 'grabbing';
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!sliderRef.current || isScrolling) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    if (Math.abs(clientX - startX) > Math.abs(clientY - startY)) e.preventDefault();
  };

  const handleDragEnd = (e: React.MouseEvent | React.TouchEvent) => {
    if (isScrolling) return;
    const clientX = 'touches' in e ? e.changedTouches[0].clientX : e.clientX;
    const diffX = clientX - startX;
    if (Math.abs(diffX) > 50) diffX > 0 ? goToPrevSlide() : goToNextSlide();
    if (sliderRef.current) sliderRef.current.style.cursor = 'grab';
  };

  const hasText = !!wishCare?.ingredients;
  const hasImages = imageUrls.length > 0;

  if (loading) return <div className="mb-8 p-6 bg-orange-50 rounded-lg">Loading...</div>;
  if (!hasText && !hasImages) return null;

  return (
    <div className="mb-8 p-6 bg-orange-50 rounded-lg">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Ingredients</h2>

      {hasText && <div className="mb-6"><p className="text-gray-700 whitespace-pre-line">{wishCare.ingredients}</p></div>}

      {hasImages && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-3">Ingredient Gallery</h3>
          <div
            className="relative overflow-hidden rounded-lg"
            ref={sliderRef}
            onMouseDown={handleDragStart}
            onMouseMove={handleDragMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchStart={handleDragStart}
            onTouchMove={handleDragMove}
            onTouchEnd={handleDragEnd}
            style={{ cursor: 'grab' }}
          >
            <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
              {imageUrls.map((url, index) => (
                <div key={index} className="min-w-full flex-shrink-0">
                  <img src={url} alt={`Ingredient ${index + 1}`} className="w-full h-auto object-cover" />
                </div>
              ))}
            </div>

            {/* Arrows */}
            <button className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-2 shadow-md hover:bg-opacity-100 transition-all z-10" onClick={e => { e.stopPropagation(); goToPrevSlide(); }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-2 shadow-md hover:bg-opacity-100 transition-all z-10" onClick={e => { e.stopPropagation(); goToNextSlide(); }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
              {imageUrls.map((_, index) => (
                <button key={index} className={`w-3 h-3 rounded-full ${index === currentIndex ? 'bg-white' : 'bg-white bg-opacity-50'}`} onClick={() => goToSlide(index)} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IngredientsSection;

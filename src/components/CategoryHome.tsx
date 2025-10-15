import React from 'react';

const CategoryHome = () => {
  const categories = [
    { id: 1, src: '/cat1.webp', alt: 'Category 1' },
    { id: 2, src: '/cat2.webp', alt: 'Category 2' },
    { id: 3, src: '/cat3.webp', alt: 'Category 3' },
    { id: 4, src: '/cat4.webp', alt: 'Category 4' },
    { id: 5, src: '/cat5.webp', alt: 'Category 5' },
    { id: 6, src: '/cat6.webp', alt: 'Category 6' },
  ];

  return (
    <div className="w-full flex items-center justify-center pt-[450px] bg-white">
      <div className="w-full p-4">
        {/* Responsive grid layout */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <div 
              key={category.id} 
              className="cursor-pointer"
            >
              <img 
                src={category.src} 
                alt={category.alt} 
                className="w-full h-auto object-cover transition-transform rounded-xl duration-300 hover:scale-105"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CategoryHome;

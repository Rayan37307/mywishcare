import React, { useState, useEffect } from 'react';

const DisSlider1 = () => {
  // Assuming dis1, dis2, dis3, etc. are the image names
  // Adjust these image names based on your actual files
  const images = [
    "/dis11.webp",
    "/dis12.webp", 
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval); // Clean up interval on unmount
  }, [images.length]);

  return (
    <div className="relative w-full h-auto">
      {images.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-2000 ease-in-out ${
            index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <img
            src={image}
            alt={`Advertisement ${index + 1}`}
            className="w-full h-auto object-cover"
          />
        </div>
      ))}
    </div>
  );
};

export default DisSlider1;
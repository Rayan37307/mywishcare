import { useState, useEffect } from 'react';

const DisSlider1 = () => {
  const images = ["/dis11.webp", "/dis12.webp"];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="w-full h-auto overflow-hidden">
      <div className="grid w-full">
        {images.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`Advertisement ${index + 1}`}
            className={`w-full h-auto object-cover transition-opacity duration-2000 ease-in-out ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ gridArea: '1 / 1 / 2 / 2' }} // All images occupy the same grid cell
          />
        ))}
      </div>
    </div>
  );
};

export default DisSlider1;
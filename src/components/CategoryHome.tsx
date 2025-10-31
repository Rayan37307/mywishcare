import { Link } from "react-router-dom";
import { useState } from "react";


const CategoryHome = () => {
  const categories = [
    { id: 1, src: '/cat1.webp', alt: 'Category 1', link: 'hairfall' },
    { id: 2, src: '/cat2.webp', alt: 'Category 2', link: 'sun-care' },
    { id: 3, src: '/cat3.webp', alt: 'Category 3', link: 'pigmentation' },
    { id: 4, src: '/cat4.webp', alt: 'Category 4', link: 'body-care' },
    { id: 5, src: '/cat5.webp', alt: 'Category 5', link: 'detan' },
    { id: 6, src: '/cat6.webp', alt: 'Category 6', link: 'bond-repair' },
  ];

  return (
    <div className="w-full flex items-center justify-center bg-white">
      <div className="w-full p-4">
        {/* Responsive grid layout */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-4">
          {categories.map((category) => (
            <CategoryCardItem 
              key={category.id} 
              category={category} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface CategoryCardItemProps {
  category: {
    id: number;
    src: string;
    alt: string;
    link: string;
  };
}

const CategoryCardItem: React.FC<CategoryCardItemProps> = ({ category }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Define a hover image path - you can implement actual hover images in the future
  // For now, this prepares the functionality for when hover images are available
  const getHoverImage = () => {
    // Try to find a hover version of the image
    const baseImage = category.src.substring(0, category.src.lastIndexOf('.'));
    const ext = category.src.substring(category.src.lastIndexOf('.'));
    const hoverImage = `${baseImage}-hover${ext}`;
    
    // For now, return the same image since hover images are not yet implemented
    // In the future, you can provide actual hover images
    return isHovered ? hoverImage : category.src;
  };

  return (
    <Link 
      to={`/collections/${category.link}`}
      className="cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img 
        src={isHovered ? getHoverImage() : category.src} 
        alt={category.alt} 
        className="w-full h-auto object-cover transition-transform rounded-xl duration-300"
      />
    </Link>
  );
}

export default CategoryHome;

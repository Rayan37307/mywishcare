import { Link } from "react-router-dom";


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
            <Link 
              to={`/collections/${category.link}`}
              key={category.id} 
              className="cursor-pointer"
            >
              <img 
                src={category.src} 
                alt={category.alt} 
                className="w-full h-auto object-cover transition-transform rounded-xl duration-300"
              />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CategoryHome;

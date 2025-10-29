

interface Collection {
  id: number;
  name: string;
  image: string;
}

const CollectionCards = () => {
  const collections: Collection[] = [
    {
      id: 1,
      name: 'Hair Care',
      image: '/haircare.jpg', // Placeholder image path - you can replace with actual image paths
    },
    {
      id: 2,
      name: 'Lip Balm',
      image: '/lipbalm.jpg',
    },
    {
      id: 3,
      name: 'Sun Care',
      image: '/suncare.jpg',
    },
    {
      id: 4,
      name: 'Detan',
      image: '/detan.jpg',
    },
    {
      id: 5,
      name: 'Face Care',
      image: '/facecare.jpg',
    },
    {
      id: 6,
      name: 'Body Care',
      image: '/bodycare.jpg',
    },
  ];

  return (
    <div className="p-4">
      {/* Responsive horizontal scroll for mobile, grid for larger screens */}
      <div className="md:hidden overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hidden">
        <div className="flex gap-4">
          {collections.map((collection) => (
            <div 
              key={collection.id} 
              className="bg-gray-500 rounded-lg overflow-hidden flex-shrink-0 flex flex-col"
              style={{ width: '130px' }} // Fixed width for mobile cards
            >
              <div className="relative pt-[100%]"> {/* 1:1 aspect ratio container */}
                <img 
                  src={collection.image} 
                  alt={collection.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <div className="p-2">
                <h3 className="text-xs text-white font-semibold text-center leading-tight h-8 flex items-center justify-center">{collection.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Grid layout for medium and larger screens */}
      <div className="hidden md:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {collections.map((collection) => (
          <div 
            key={collection.id} 
            className="bg-gray-500 rounded-lg overflow-hidden flex flex-col"
          >
            <div className="relative pt-[100%]"> {/* 1:1 aspect ratio container */}
              <img 
                src={collection.image} 
                alt={collection.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            <div className="p-3">
              <h3 className="text-lg text-white font-semibold text-center leading-tight h-10 flex items-center justify-center">{collection.name}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CollectionCards;
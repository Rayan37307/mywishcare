import React from 'react';

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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {collections.map((collection) => (
        <div 
          key={collection.id} 
          className="bg-gray-500 rounded-lg overflow-hidden"
        >
          <div className="h-auto relative  flex items-center justify-center">
            <img 
              src={collection.image} 
              alt={collection.name}
              className="w-full h-full object-cover aspect-square"
            />
          <div className="absolute bottom-5 left-5">
            <h3 className="text-xl text-white font-semibold text-center">{collection.name}</h3>
          </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CollectionCards;
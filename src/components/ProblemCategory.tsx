const ProblemCategory = () => {
  const problems = [
    { id: 3, name: 'Hair Fall', image: '/hairfall.webp' },
    { id: 6, name: 'Skin Care', image: '/skincare.webp' },
    { id: 5, name: 'Scalp Care', image: '/sculpcare.webp' },
    { id: 2, name: 'De-tan', image: '/detan.webp' },
    { id: 1, name: 'Dandruff', image: '/dandruff.webp' },
    { id: 4, name: 'Lip Care', image: '/lipcare.webp' },
  ];

  return (
    <div className="w-full overflow-x-auto py-4 scroll-smooth scrollbar-hidden">
      <div className="flex gap-4">
        {problems.map((problem) => (
          <div
            key={problem.id}
            className="flex-shrink-0 flex flex-col items-center text-center"
            style={{ flexBasis: '15.66%' }} // 6 cards fit in one row
          >
            <div className="w-full aspect-square overflow-hidden rounded-xl mb-2">
              <img
                src={problem.image}
                alt={problem.name}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-sm md:text-base font-medium">
              {problem.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProblemCategory;

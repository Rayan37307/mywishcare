import { Link } from "react-router-dom";

const ProblemCategory = () => {
const problems = [
    { id: 3, name: 'Hair Fall', image: '/hairfall.webp', link: '/collections/hairfall' },
    { id: 6, name: 'Sun Care', image: '/skincare.webp', link: '/collections/sun-care' },
    { id: 5, name: 'Sculp Care', image: '/sculpcare.webp', link: "/collections/hair-care-1" },
    { id: 2, name: 'De-tan', image: '/detan.webp' , link: '/collections/detan' },
    { id: 1, name: 'Dandruff', image: '/dandruff.webp', link: '/collections/dandruff' },
    { id: 4, name: 'Lip Care', image: '/lipcare.webp',  link: '/collections/lip-balm' },
  ]


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
              <Link to={problem.link}>
              <img
                src={problem.image}
                alt={problem.name}
                className="w-full h-full object-cover"
              />
              </Link>
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

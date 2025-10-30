
const Features = () => {
  const features = [
    {
      id: 1,
      image: "/effselfcare.webp",
    },
    {
      id: 2,
      image: "/muliapproach.jpg",
    },
    {
      id: 3,
      image: "/bioingradients.webp",
    }
  ];

  return (
    <div className="py-8">
      <div className="overflow-x-auto scrollbar-hidden">
        <div className="flex space-x-4 px-4">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="flex-shrink-0 max-md:w-[70vw] w-[400px]"
            >
              <div className="rounded-lg overflow-hidden shadow-md h-full">
                <img
                  src={feature.image}
                  alt={`Feature ${feature.id}`}
                  className="h-full w-full object-cover rounded-lg"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;

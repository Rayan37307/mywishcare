import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Mousewheel, FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/free-mode';

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
    <div className="py-8 ">
     <Swiper
  modules={[Pagination, Mousewheel, FreeMode]}
  spaceBetween={10}
  slidesPerView={'auto'}             // natural scroll
  freeMode={{ enabled: true, momentum: false }} // no extra overscroll
  mousewheel={true}
  pagination={false}
  className="rounded-lg overflow-hidden w-full"
>
  {features.map((feature) => (
    <SwiperSlide
      key={feature.id}
      className="flex-1 min-w-[250px] sm:min-w-[280px] md:min-w-[300px]"
    >
      <div className="rounded-lg overflow-hidden shadow-md h-full">
        <img
          src={feature.image}
          alt={`Feature ${feature.id}`}
          className="h-full w-full object-cover rounded-lg"
        />
      </div>
    </SwiperSlide>
  ))}
</Swiper>

    </div>
  );
};

export default Features;
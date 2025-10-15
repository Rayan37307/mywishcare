import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Mousewheel, FreeMode } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/mousewheel';
import 'swiper/css/free-mode';
interface Product {
  id: number;

  name: string;
  price: string;
  image: string;
  description: string;
}

const BestSellers = () => {
  // Sample product data for UI development
  const sampleProducts: Product[] = [
    {
      id: 1,
      name: 'Anti-Dandruff Shampoo',
      price: '299.00',
      image: '/dandruff.webp',
      description: 'Specially formulated to combat dandruff and soothe scalp irritation.'
    },
    {
      id: 2,
      name: 'De-Tan Face Wash',
      price: '199.00',
      image: '/detan.webp',
      description: 'Gentle face wash that removes tan and impurities while restoring natural glow.'
    },
    {
      id: 3,
      name: 'Hair Fall Control Serum',
      price: '399.00',
      image: '/hairfall.webp',
      description: 'Advanced serum to reduce hair fall and promote healthy hair growth. Contains biotin and natural oils.'
    },
    {
      id: 4,
      name: 'Lip Care Kit',
      price: '149.00',
      image: '/lipcare.webp',
      description: 'Complete lip care solution including balm and scrub for soft, healthy lips. With SPF protection.'
    },
    {
      id: 5,
      name: 'Sculp Care Oil',
      price: '249.00',
      image: '/sculpcare.webp',
      description: 'Nourishing oil for scalp health. Helps with dryness, irritation, and promotes healthy hair growth.'
    },
    {
      id: 6,
      name: 'Skin Care Essentials',
      price: '499.00',
      image: '/skincare.webp',
      description: 'Complete skincare routine with cleanser, toner, and moisturizer. Suitable for all skin types.'
    },
  ];

  return (
    <div className="py-8">
      <h2 className="text-3xl font-bold mb-8 text-left">Best Sellers</h2>
     <Swiper
  modules={[Mousewheel, FreeMode]}
  spaceBetween={20}               // gap between cards
  slidesPerView={'auto'}          // allows natural horizontal scroll
  freeMode={{ enabled: true, momentum: false }} // smooth scrolling
  mousewheel={true}
  className="mySwiper"
>
  {sampleProducts.map((product) => (
    <SwiperSlide
      key={product.id}
      className="!w-[250px] sm:!w-[280px] md:!w-[300px]" // keeps cards consistent width
    >
      {/* Your exact card JSX from before */}
      <div className="bg-white rounded-lg overflow-hidden p-2 max-w-[250px] h-full flex flex-col">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-56 object-cover rounded-lg"
        />
        <div className="text-center flex-grow">
          <h3 className="text-[15px] mt-4">{product.name}</h3>
          <p className="text-[10px] text-black">{product.description.substring(0, 100)}...</p>
          <p className="text-black mb-2 mt-2">₹{product.price}</p>
        </div>
        <button className='w-full py-2 bg-[#D4F871] uppercase rounded-md border-1 text-sm border-black flex justify-center items-center gap-2'>
          Add to cart 
          <svg aria-hidden="true" fill="none" focusable="false" width="15" viewBox="0 0 24 24">
            <path d="M4.75 8.25A.75.75 0 0 0 4 9L3 19.125c0 1.418 1.207 2.625 2.625 2.625h12.75c1.418 0 2.625-1.149 2.625-2.566L20 9a.75.75 0 0 0-.75-.75H4.75Zm2.75 0v-1.5a4.5 4.5 0 0 1 4.5-4.5v0a4.5 4.5 0 0 1 4.5 4.5v1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
        </button>
      </div>
    </SwiperSlide>
  ))}
</Swiper>


      <style jsx>{`
        .swiper-button-next,
        .swiper-button-prev {
          background-color: #fff;
          color: #000;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          border: 2px solid #ccc;
        }
        .swiper-button-next:hover,
        .swiper-button-prev:hover {
          background-color: #f0f0f0;
          transform: scale(1.05);
        }
        .swiper-button-next::after,
        .swiper-button-prev::after {
          font-size: 12px;
          font-weight: bold;
        }
      `}</style>
   
    </div>
  );
};

export default BestSellers;
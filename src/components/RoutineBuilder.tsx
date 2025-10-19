import React, { useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Mousewheel, FreeMode } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/mousewheel';
import 'swiper/css/free-mode';
import { Link } from 'react-router-dom';
import { useProductStore } from '../store/productStore';
import { useCartStore } from '../store/cartStore';

const RoutineBuilder = () => {
  const { routineBuilderProducts, loading, error, fetchRoutineBuilderProducts } = useProductStore();
  const { addItem } = useCartStore();

  const handleAddToCart = (product: any) => {
    addItem(product, 1);
  };

  useEffect(() => {
    if (routineBuilderProducts.length === 0) {
      fetchRoutineBuilderProducts();
    }
  }, [routineBuilderProducts.length, fetchRoutineBuilderProducts]);

  if (loading && routineBuilderProducts.length === 0) {
    return (
      <div className="py-8">
        <h2 className="text-3xl font-bold mb-8 text-left">Routine Builder</h2>
        <p>Loading products for your routine...</p>
      </div>
    );
  }

  if (error && routineBuilderProducts.length === 0) {
    return (
      <div className="py-8">
        <h2 className="text-3xl font-bold mb-8 text-left">Routine Builder</h2>
        <p>Error loading products: {error}</p>
      </div>
    );
  }

  return (
    <div className="py-8">
      <h2 className="text-3xl font-bold mb-8 text-left">Routine Builder</h2>
      <Swiper
       modules={[Mousewheel, FreeMode]}
       spaceBetween={20}               // gap between cards
       slidesPerView={'auto'}          // allows natural horizontal scroll
       freeMode={{ enabled: true, momentum: false }} // smooth scrolling
       mousewheel={true}
       className="mySwiper"
     >
       {routineBuilderProducts.map((product) => (
         <SwiperSlide
           key={product.id}
           className="!w-[250px] sm:!w-[280px] md:!w-[300px]" // keeps cards consistent width
         >
           <Link to={`/products/${product.id}`} className="h-full">
             {/* Your exact card JSX from before */}
             <div className="bg-white rounded-lg overflow-hidden p-2 max-w-[250px] h-full flex flex-col">
               <img 
                 src={product.images[0]?.src || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPgogIDxwYXRoIGQ9Ik0yMiAydi0yYTIgMiAwIDAgMC0yLTJIMTRhMiAyIDAgMCAwLTIgMnYySDRhMiAyIDAgMCAwLTIgMnYxNGEyIDIgMCAwIDAgMiAyaDE2YTIgMiAwIDAgMCAyLTJWMnptLTQgMTZINnYtMmgxMnYyem0wLTRINnYtMmgxMnYyem0wLTRINnYtMmgxMnYyem0wLTRINnYtMmgxMnYyem0wLTRINnYtMmgxMnYyeiIgLz4KPC9zdmc+'} 
                 alt={product.name} 
                 className="w-full h-56 object-cover rounded-lg"
               />
               <div className="text-center flex-grow">
                 <h3 className="text-[15px] mt-4">{product.name}</h3>
                 <p
                   className="text-[10px] text-black"
                   dangerouslySetInnerHTML={{ __html: product.short_description }}
                 />
                 <p className="text-black mb-2 mt-2">₹{product.price}</p>
               </div>
               <button 
                 className='w-full py-2 bg-[#D4F871] uppercase rounded-md border-1 text-sm border-black flex justify-center items-center gap-2'
                 onClick={(e) => {
                   e.preventDefault();
                   handleAddToCart(product);
                 }}
               >
                 Add to cart 
                 <svg aria-hidden="true" fill="none" focusable="false" width="15" viewBox="0 0 24 24">
                   <path d="M4.75 8.25A.75.75 0 0 0 4 9L3 19.125c0 1.418 1.207 2.625 2.625 2.625h12.75c1.418 0 2.625-1.149 2.625-2.566L20 9a.75.75 0 0 0-.75-.75H4.75Zm2.75 0v-1.5a4.5 4.5 0 0 1 4.5-4.5v0a4.5 4.5 0 0 1 4.5 4.5v1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                 </svg>
               </button>
             </div>
           </Link>
         </SwiperSlide>
       ))}
     </Swiper>      <style jsx>{`
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

export default RoutineBuilder;
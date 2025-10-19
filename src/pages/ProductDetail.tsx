import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useProductStore } from '../store/productStore';
import ActiveOffersSection from '../components/wishcare/ActiveOffersSection';
import BenefitsSection from '../components/wishcare/BenefitsSection';
import WhatMakesItGreatSection from '../components/wishcare/WhatMakesItGreatSection';
import HowToUseSection from '../components/wishcare/HowToUseSection';
import IngredientsSection from '../components/wishcare/IngredientsSection';
import ResultsSection from '../components/wishcare/ResultsSection';
import PairsWithSection from '../components/wishcare/PairsWithSection';
import FAQSection from '../components/wishcare/FAQSection';
import { getImageUrlFromId } from '../utils/imageUtils';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { fetchProductById, setLoading, setError } = useProductStore();
  const [product, setProduct] = React.useState<any>(null);
  const [loading, setLoadingState] = React.useState(true);

  useEffect(() => {
    const getProduct = async () => {
      if (id) {
        setLoading(true);
        try {
          // Fetch product with WishCare data
          const fetchedProduct = await fetchProductById(Number(id));
          setProduct(fetchedProduct);
        } catch (err) {
          setError('Failed to fetch product');
        } finally {
          setLoading(false);
          setLoadingState(false);
        }
      }
    };

    getProduct();
  }, [id, fetchProductById, setLoading, setError]);

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (!product) {
    return <div className="text-center">Product not found.</div>;
  }

  return (
    <div className='bg-white py-10'>
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <img src={product.images[0]?.src} alt={product.name} className="w-[80%] rounded-lg" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p
              className="text-[12px] my-3 text-black"
              dangerouslySetInnerHTML={{ __html: product.short_description }}
            />
            <div className="text-2xl text-gray-800 mb-4">₹{product.price}</div>
            
            <button className="mt-4 w-full py-3 bg-transparent uppercase flex items-center justify-center gap-2 border-1 text-[13px] border-gray-600 font-semibold">Add to Cart <svg
              aria-hidden="true"
              fill="none"
              focusable="false"
              width="15"
              viewBox="0 0 24 24"
            >
              <path
                d="M4.75 8.25A.75.75 0 0 0 4 9L3 19.125c0 1.418 1.207 2.625 2.625 2.625h12.75c1.418 0 2.625-1.149 2.625-2.566L20 9a.75.75 0 0 0-.75-.75H4.75Zm2.75 0v-1.5a4.5 4.5 0 0 1 4.5-4.5v0a4.5 4.5 0 0 1 4.5 4.5v1.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
            </svg></button>
             <button className="mt-4 w-full py-3 bg-black text-white uppercase flex items-center justify-center gap-2 border-1  text-[13px] border-black font-semibold">buy it now</button>
             <div
              className="prose pt-10"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
            {product.wishCare && (
          <div className="mt-4">
            {/* <h2 className="text-2xl font-bold mb-6 text-gray-800">Product Details</h2>
             */}
            <div className='w-full mb-4'>
              <img src="/multi.webp" alt="w-full" />
            </div>
            <ActiveOffersSection wishCare={product.wishCare} />
            <BenefitsSection wishCare={product.wishCare} />
            <WhatMakesItGreatSection 
              wishCare={product.wishCare} 
              getImageUrlFromId={getImageUrlFromId} 
            />
            <HowToUseSection 
              wishCare={product.wishCare} 
              getImageUrlFromId={getImageUrlFromId} 
            />
            <IngredientsSection wishCare={product.wishCare} />
            <ResultsSection 
              wishCare={product.wishCare} 
              getImageUrlFromId={getImageUrlFromId} 
            />
            <PairsWithSection wishCare={product.wishCare} />
            <FAQSection wishCare={product.wishCare} />
          </div>
        )}
          </div>
        </div>

        {/* WishCare Sections - Stack below everything else */}
        {/* {product.wishCare && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Product Details</h2>
            
            <ActiveOffersSection wishCare={product.wishCare} />
            <BenefitsSection wishCare={product.wishCare} />
            <WhatMakesItGreatSection 
              wishCare={product.wishCare} 
              getImageUrlFromId={getImageUrlFromId} 
            />
            <HowToUseSection 
              wishCare={product.wishCare} 
              getImageUrlFromId={getImageUrlFromId} 
            />
            <IngredientsSection wishCare={product.wishCare} />
            <ResultsSection 
              wishCare={product.wishCare} 
              getImageUrlFromId={getImageUrlFromId} 
            />
            <PairsWithSection wishCare={product.wishCare} />
            <FAQSection wishCare={product.wishCare} />
          </div>
        )} */}
      </div>
    </div>
  );
};

export default ProductDetail;
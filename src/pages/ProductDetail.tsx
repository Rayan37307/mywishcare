import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProductStore } from '../store/productStore';
import { useCartStore } from '../store/cartStore';
import ActiveOffersSection from '../components/wishcare/ActiveOffersSection';
import BenefitsSection from '../components/wishcare/BenefitsSection';
import HowToUseSection from '../components/wishcare/HowToUseSection';
import IngredientsSection from '../components/wishcare/IngredientsSection';
import ResultsSection from '../components/wishcare/ResultsSection';
import PairsWithSection from '../components/wishcare/PairsWithSection';
import FAQSection from '../components/wishcare/FAQSection';
import { getImageUrlFromId } from '../utils/imageUtils';
import type { Product } from '../types/product';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { fetchProductById, setLoading, setError } = useProductStore();
  const { addItem } = useCartStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoadingState] = useState(true);
  const quantity = 1;
  const addToCartRef = useRef<HTMLDivElement>(null);
  
  const [showFloatingHeader, setShowFloatingHeader] = useState(false);

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
    }
  };

  useEffect(() => {
    // Add scroll event listener
    const handleScroll = () => {
      if (addToCartRef.current) {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        // Show floating header when scrolled past the add to cart section (considering navbar height)
        if (scrollTop > 300) { // Show after scrolling down 300px, which should be past the product details
          setShowFloatingHeader(true);
        } else {
          setShowFloatingHeader(false);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const getProduct = async () => {
      if (id) {
        setLoading(true);
        try {
          // Fetch product with WishCare data
          const fetchedProduct = await fetchProductById(Number(id));
          setProduct(fetchedProduct);
        } catch {
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
      {showFloatingHeader && (
        <div className="fixed top-[110px] z-20 left-0 right-0 bg-white shadow-md py-3 px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-16 h-16 overflow-hidden rounded-lg mr-4">
              <img 
                src={product.images[0]?.src} 
                alt={product.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="font-bold truncate max-w-[50vw]">{product.name}</h2>
              <div className="text-sm text-gray-600">
                {product.sale_price && product.sale_price !== '' && product.sale_price !== product.regular_price ? (
                  <div className="flex flex-col justify-center">
                  <div className="">
                    <span className="text-red-500 mr-4">₹{product.sale_price}</span>

                    <span className="text-gray-500 line-through text-xs ">₹{product.regular_price}</span>
                    <p className="text-[11px] text-gray-600">Inclusive of all taxes</p>
                    </div>
                  </div>
                ) : (
                  <span>₹{product.price}</span>
                )}
              </div>
            </div>
          </div>
          <button 
            className="bg-black text-white px-4 py-3 uppercase text-sm font-semibold flex items-center justify-center gap-1"
            onClick={handleAddToCart}
          >
            Add to cart<svg style={{marginLeft: '6px', width: '16px', marginTop: '-3px'}} aria-hidden="true" fill="none" focusable="false" width="15" viewBox="0 0 24 24"><path d="M4.75 8.25A.75.75 0 0 0 4 9L3 19.125c0 1.418 1.207 2.625 2.625 2.625h12.75c1.418 0 2.625-1.149 2.625-2.566L20 9a.75.75 0 0 0-.75-.75H4.75Zm2.75 0v-1.5a4.5 4.5 0 0 1 4.5-4.5v0a4.5 4.5 0 0 1 4.5 4.5v1.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>

          </button>
        </div>
      )}
      
      {/* Main content */}
      <div className={`container mx-auto max-w-7xl p-4 ${showFloatingHeader ? 'pt-20' : ''}`}>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Image Gallery Column - Left Side */}
<div className="md:col-span-2 flex flex-col md:sticky md:top-56 self-start h-fit">
  <div className="flex justify-center items-start gap-4">
    
    {/* Thumbnails - Left Side */}
    <div className="flex flex-col gap-3">
      {product.images.map((image, index) => (
        <div
          key={index}
          className="w-16 h-16 overflow-hidden rounded cursor-pointer border-2 border-transparent hover:border-gray-400 thumb-container"
          onClick={() => {
            const mainImage = document.getElementById('mainImage') as HTMLImageElement;
            if (mainImage) {
              mainImage.src = image.src;
              const containers = document.querySelectorAll('.thumb-container');
              containers.forEach((container, i) => {
                if (i === index) {
                  container.classList.add('border-gray-800');
                  container.classList.remove('border-transparent');
                } else {
                  container.classList.remove('border-gray-800');
                  container.classList.add('border-transparent');
                }
              });
            }
          }}
        >
          <img
            src={image.src}
            alt={`Thumbnail ${index + 1}`}
            className="w-full h-full object-cover"
          />
        </div>
      ))}
    </div>

    {/* Main Image - Right of Thumbnails */}
    <div className="flex-1 flex justify-center">
      <img
        id="mainImage"
        src={product.images[0]?.src}
        alt={product.name}
        className="max-w-full rounded-lg object-cover"
      />
    </div>
  </div>
</div>

          
          <div className="md:col-span-3">
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p
              className="text-[12px] my-3 text-black"
              dangerouslySetInnerHTML={{ __html: product.short_description }}
            />
            <div className="text-2xl text-gray-800 mb-4">
              {product.sale_price && product.sale_price !== '' && product.sale_price !== product.regular_price ? (
                <div className="flex flex-col justify-center gap-2">
                <div>
                  <span>₹{product.sale_price}</span>
                  <span className="text-gray-500 line-through text-sm mr-2 ml-4">MRP ₹{product.regular_price}</span>
                  </div>
                  <p className="text-[13px] text-gray-600">Inclusive of all taxes</p>
                </div>
              ) : (
                <span>₹{product.price}</span>
              )}
            </div>
            
            {/* Add to cart section */}
            <div 
              ref={addToCartRef}
              className="flex items-center gap-4 mt-4"
            >
              <button 
                className="w-full py-3 bg-transparent uppercase flex items-center justify-center gap-2 border-1 text-[13px] border-gray-600 font-semibold"
                onClick={handleAddToCart}
              >
                Add to Cart 
                <svg
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
                </svg>
              </button>
            </div>
            <button className="mt-4 w-full py-3 bg-black text-white uppercase flex items-center justify-center gap-2 border-1  text-[13px] border-black font-semibold">buy it now</button>
            <div
              className="prose pt-10"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
            {product.wishCare && (
              <div className="mt-4">
                <div className='w-full mb-4'>
                  <img src="/multi.webp" alt="w-full" />
                </div>
                <ActiveOffersSection wishCare={product.wishCare} />
                <BenefitsSection wishCare={product.wishCare} />
                <HowToUseSection 
                  wishCare={product.wishCare} 
                  getImageUrlFromId={getImageUrlFromId} 
                />
                <IngredientsSection 
                  wishCare={product.wishCare} 
                  getImageUrlFromId={getImageUrlFromId} 
                />
                <ResultsSection 
                  wishCare={product.wishCare} 
                  getImageUrlFromId={getImageUrlFromId} 
                />
                <PairsWithSection wishCare={product.wishCare} />
              </div>
            )}
            
          </div>

        </div>
        
        {product.wishCare && (
          <div className="mt-4">
            <FAQSection wishCare={product.wishCare} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;

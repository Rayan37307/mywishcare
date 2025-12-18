import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProductStore } from '../store/productStore';
import { useCartStore } from '../store/cartStore';
import ActiveOffersSection from '../components/wishcare/ActiveOffersSection';
import BenefitsSection from '../components/wishcare/BenefitsSection';
import HowToUseSection from '../components/wishcare/HowToUseSection';
import IngredientsSection from '../components/wishcare/IngredientsSection';
import ResultsSection from '../components/wishcare/ResultsSection';
import PairsWithSection from '../components/wishcare/PairsWithSection';
import FAQSection from '../components/wishcare/FAQSection';
import TrendingProducts from '../components/TrendingProducts';
import RecentlyViewedProducts from '../components/RecentlyViewedProducts';
import { getImageUrlFromId } from '../utils/imageUtils';
import type { Product } from '../types/product';
import { CheckCircleIcon } from 'lucide-react';
import Skeleton from '../components/Skeleton';
import { pixelYourSiteService } from '../services/pixelYourSiteService';

const ProductDetail = () => {
  const { id, slug } = useParams<{ id?: string; slug?: string }>();
  const navigate = useNavigate();
  const { fetchProductById, fetchProductBySlug, setLoading, setError } = useProductStore();
  const { addItem, addDirectPurchaseItem, items } = useCartStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoadingState] = useState(true);
  const [shouldNavigate, setShouldNavigate] = useState(false);
  const quantity = 1;
  const addToCartRef = useRef<HTMLDivElement>(null);

  const [showFloatingHeader, setShowFloatingHeader] = useState(false);
  const [showMobileBottomBar, setShowMobileBottomBar] = useState(false);

  const handleAddToCart = () => {
    if (product) {
      // Track add to cart with PixelYourSite
      pixelYourSiteService.trackAddToCart({
        product_id: product.id,
        product_name: product.name,
        product_price: parseFloat(product.price.replace(/[^\\d.-]/g, '')),
        currency: 'BDT',
        quantity: quantity,
        value: parseFloat(product.price.replace(/[^\\d.-]/g, '')) * quantity,
      });

      // The stock check is now handled in the cart store
      addItem(product, quantity);
    }
  };

  const handleBuyNow = () => {
    if (product) {
      // Track add to cart for immediate purchase
      pixelYourSiteService.trackAddToCart({
        product_id: product.id,
        product_name: product.name,
        product_price: parseFloat(product.price.replace(/[^\\d.-]/g, '')),
        currency: 'BDT',
        quantity: quantity,
        value: parseFloat(product.price.replace(/[^\\d.-]/g, '')) * quantity,
      });

      // Add product to cart without opening the cart slide (for direct purchase)
      // The stock check is now handled in the cart store
      addDirectPurchaseItem(product, quantity);
      setShouldNavigate(true);
    }
  };

  // Check if product is out of stock
  const isOutOfStock = product?.stock_status === 'outofstock';

  // Effect to navigate when cart is updated after buy now
  useEffect(() => {
    if (shouldNavigate && items.length > 0) {
      // Check if the product was added to the cart
      if (product && items.some(item => item.product.id === product.id)) {
        setShouldNavigate(false);
        navigate('/checkout');
      }
    }
  }, [items, shouldNavigate, product, navigate]);

  // Scroll handler for floating header & mobile bottom bar
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      if (!addToCartRef.current) return;

      const offsetTop = addToCartRef.current.offsetTop;

      if (window.innerWidth >= 768) {
        setShowFloatingHeader(scrollTop > offsetTop);
        setShowMobileBottomBar(false);
      } else {
        setShowMobileBottomBar(scrollTop > offsetTop);
        setShowFloatingHeader(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch product by ID or slug and redirect to slug-based URL if accessed via ID
  useEffect(() => {
    const getProduct = async () => {
      if (!id && !slug) return;
      
      let fetchedProduct: Product | null = null;
      setLoading(true);
      try {
        if (slug) {
          // Try to fetch by slug first
          fetchedProduct = await fetchProductBySlug(slug);
        } else if (id) {
          // Fallback to ID if no slug provided
          fetchedProduct = await fetchProductById(Number(id));
        }
        
        if (fetchedProduct) {
          // If accessed by ID but slug exists, redirect to slug-based URL for SEO
          if (id && fetchedProduct.slug && !slug) {
            navigate(`/products/${fetchedProduct.slug}`, { replace: true });
            return;
          }
          setProduct(fetchedProduct);
        } else {
          setError('Product not found');
        }
      } catch {
        setError('Failed to fetch product');
      } finally {
        setLoading(false);
        setLoadingState(false);
        
        // Track product view after loading
        if (fetchedProduct) {
          pixelYourSiteService.trackProductView({
            product_id: fetchedProduct.id,
            product_name: fetchedProduct.name,
            product_price: parseFloat(fetchedProduct.price.replace(/[^\\d.-]/g, '')),
            currency: 'BDT',
            value: parseFloat(fetchedProduct.price.replace(/[^\\d.-]/g, '')),
          });
        }
      }
    };
    getProduct();
  }, [id, slug, fetchProductById, fetchProductBySlug, setLoading, setError, navigate]);

  if (loading) {
    return (
      <div className="bg-white py-10">
        <div className="container mx-auto max-w-7xl p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {/* Images Column Skeleton */}
            <div className="md:col-span-2 flex flex-col">
              <Skeleton variant="rectangular" className="w-full h-96 rounded-lg mb-4" />
              <div className="flex gap-3 mt-4">
                <Skeleton variant="rectangular" className="w-16 h-16 rounded" />
                <Skeleton variant="rectangular" className="w-16 h-16 rounded" />
                <Skeleton variant="rectangular" className="w-16 h-16 rounded" />
              </div>
            </div>

            {/* Details Column Skeleton */}
            <div className="md:col-span-3">
              <Skeleton variant="text" className="h-8 w-3/4 mb-4" />
              <Skeleton variant="text" className="h-4 w-full mb-4" />
              <Skeleton variant="text" className="h-6 w-1/4 mb-6" />
              
              <div className="flex items-center gap-4 mt-4 mb-6">
                <Skeleton variant="rectangular" className="w-1/2 h-12 rounded" />
              </div>
              
              <Skeleton variant="rectangular" className="w-full h-12 rounded mb-4" />
              
              <Skeleton variant="rectangular" className="w-full h-48 rounded mt-10" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (!product) return <div className="text-center">Product not found.</div>;

  return (
    <div className="bg-white py-10 relative">
      {/* Desktop Floating Header */}
      {showFloatingHeader && (
        <div className="fixed top-[104px] z-20 left-0 right-0 bg-white shadow-md py-3 px-4 md:px-8 items-center justify-between hidden md:flex">
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
                {product.sale_price && product.sale_price !== product.regular_price ? (
                  <div className="flex flex-col justify-center">
                    <div>
                      <span className="text-red-500 mr-4">৳{product.sale_price}</span>
                      <span className="text-gray-500 line-through text-xs">৳{product.regular_price}</span>
                    </div>
                  </div>
                ) : (
                  <span>৳{product.price}</span>
                )}
              </div>
            </div>
          </div>
          <button 
            className={`px-4 py-3 uppercase text-sm font-semibold flex items-center justify-center gap-1 ${
              isOutOfStock 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-black text-white'
            }`}
            onClick={handleAddToCart}
            disabled={isOutOfStock}
          >
            {isOutOfStock ? 'Out of Stock' : 'Add to cart'}
            {!isOutOfStock && (
              <svg style={{ marginLeft: '6px', width: '16px', marginTop: '-3px' }} aria-hidden="true" fill="none" viewBox="0 0 24 24">
                <path d="M4.75 8.25A.75.75 0 0 0 4 9L3 19.125c0 1.418 1.207 2.625 2.625 2.625h12.75c1.418 0 2.625-1.149 2.625-2.566L20 9a.75.75 0 0 0-.75-.75H4.75Zm2.75 0v-1.5a4.5 4.5 0 0 1 4.5-4.5v0a4.5 4.5 0 0 1 4.5 4.5v1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
            )}
          </button>
        </div>
      )}

      {/* Mobile Bottom Bar */}
      {showMobileBottomBar && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-md p-3 flex gap-3 justify-center md:hidden">
          <button 
            className={`flex-1 py-3 uppercase flex items-center rounded-xl border-1 justify-center gap-2 font-semibold ${
              isOutOfStock 
                ? 'bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed' 
                : 'bg-black text-white border-1'
            }`}
            onClick={handleAddToCart}
            disabled={isOutOfStock}
          >
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            {!isOutOfStock && (
              <svg aria-hidden="true" fill="none" focusable="false" width="15" viewBox="0 0 24 24">
                <path d="M4.75 8.25A.75.75 0 0 0 4 9L3 19.125c0 1.418 1.207 2.625 2.625 2.625h12.75c1.418 0 2.625-1.149 2.625-2.566L20 9a.75.75 0 0 0-.75-.75H4.75Zm2.75 0v-1.5a4.5 4.5 0 0 1 4.5-4.5v0a4.5 4.5 0 0 1 4.5 4.5v1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
            )}
          </button>
          <button 
            className={`flex-1 py-3 rounded-xl border-1 uppercase flex items-center justify-center gap-2 font-semibold ${
              isOutOfStock 
                ? 'bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed' 
                : 'bg-[#D4F871] text-black border-1'
            }`}
            onClick={handleBuyNow}
            disabled={isOutOfStock}
          >
            {isOutOfStock ? 'Out of Stock' : 'Buy it now'} {!isOutOfStock && <CheckCircleIcon />}
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className={`container mx-auto max-w-7xl p-4 ${showFloatingHeader ? 'pt-20' : ''}`}>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
 {/* Images Column */}
<div className="md:col-span-2 flex flex-col md:sticky md:top-56 self-start h-fit">
  {window.innerWidth >= 768 ? (
    // Desktop: Thumbnails + main image
    <div className="flex justify-center items-start gap-4">
      <div className="flex flex-col gap-3">
        {product.images.map((image, index) => (
          <div
            key={index}
            className="w-16 h-16 overflow-hidden rounded cursor-pointer border-2 border-transparent hover:border-gray-400 thumb-container"
            onClick={() => {
              const mainImage = document.getElementById('mainImage') as HTMLImageElement;
              if (mainImage) mainImage.src = image.src;
              document.querySelectorAll('.thumb-container').forEach((c, i) => {
                c.classList.toggle('border-gray-800', i === index);
                c.classList.toggle('border-transparent', i !== index);
              });
            }}
          >
            <img src={image.src} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
      <div className="flex-1 flex justify-center">
        <img id="mainImage" src={product.images[0]?.src} alt={product.name} className="max-w-full rounded-lg object-cover" />
      </div>
    </div>
  ) : (
    // ✅ Mobile: Horizontal scroll slider with slight border
    <div className="flex gap-4 overflow-x-auto scrollbar-none snap-x snap-mandatory px-1">
      {product.images.map((image, index) => (
        <div
          key={index}
          className="shrink-0 w-72 h-72 snap-center rounded-lg overflow-hidden border-2 border-black/50"
        >
          <img
            src={image.src}
            alt={`Slide ${index + 1}`}
            className="w-full h-full object-cover"
          />
        </div>
      ))}
    </div>
  )}
</div>



          {/* Details Column */}
          <div className="md:col-span-3">
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-[12px] my-3 text-black" dangerouslySetInnerHTML={{ __html: product.short_description }} />
            <div className="text-2xl text-gray-800 mb-4">
              {product.sale_price && product.sale_price !== product.regular_price ? (
                <div className="flex flex-col justify-center gap-2">
                  <div>
                    <span>৳{product.sale_price}</span>
                    <span className="text-gray-500 line-through text-sm mr-2 ml-4">BDT ৳{product.regular_price}</span>
                  </div>
                </div>
              ) : <span>৳{product.price}</span>}
            </div>

            {/* Original Add to Cart Section */}
            <div ref={addToCartRef} className="flex items-center gap-4 mt-4">
              <button 
                className={`w-full py-3 bg-transparent uppercase flex items-center justify-center gap-2 border-1 text-[13px] font-semibold ${
                  isOutOfStock 
                    ? 'border-gray-300 text-gray-400 cursor-not-allowed' 
                    : 'border-gray-600 text-gray-700'
                }`}
                onClick={handleAddToCart}
                disabled={isOutOfStock}
              >
                {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>
            <button 
              className={`mt-4 w-full py-3 uppercase flex items-center justify-center gap-2 border-1 text-[13px] font-semibold ${
                isOutOfStock 
                  ? 'bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed' 
                  : 'bg-black text-white border-black'
              }`}
              onClick={handleBuyNow}
              disabled={isOutOfStock}
            >
              {isOutOfStock ? 'Out of Stock' : 'Buy it now'}
            </button>

            {/* Description & WishCare sections */}
            <div className="prose pt-10" dangerouslySetInnerHTML={{ __html: product.description }} />
            {product.wishCare && (
              <div className="mt-4">
                <div className="w-full mb-4">
                  <img src="/multi.webp" alt="w-full" />
                </div>
                <ActiveOffersSection wishCare={product.wishCare} />
                <BenefitsSection wishCare={product.wishCare} />
                <HowToUseSection wishCare={product.wishCare} getImageUrlFromId={getImageUrlFromId} />
                <IngredientsSection wishCare={product.wishCare} getImageUrlFromId={getImageUrlFromId} />
                <ResultsSection wishCare={product.wishCare} getImageUrlFromId={getImageUrlFromId} />
                <PairsWithSection wishCare={product.wishCare} />
              </div>
            )}
          </div>
        </div>

        {/* Trending Products Section */}
        <TrendingProducts currentProductId={product.id} />

        {/* Recently Viewed Products Section */}
        <RecentlyViewedProducts currentProductId={product.id} />

        {product.wishCare && <FAQSection wishCare={product.wishCare} />}
      </div>
    </div>
  );
};

export default ProductDetail;

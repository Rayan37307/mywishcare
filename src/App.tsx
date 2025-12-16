import { useState, lazy, Suspense, useEffect, useCallback } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { setGlobalOpenCartFunction } from './store/cartStore';

// Contexts
import { ThemeProvider } from './contexts/ThemeContext';
import { ProductProvider } from './contexts/ProductContext';
import { OrderProvider } from './contexts/OrderContext';
import { SidebarProvider } from './contexts/SidebarContext';

// Error boundary
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'))
const Collections = lazy(() => import('./pages/Collections'))
const BestSellers = lazy(() => import('./pages/BestSellers'))
const About = lazy(() => import('./pages/About'))
const AllProducts = lazy(() => import('./pages/AllProducts'))
const TermsOfService = lazy(() => import('./pages/TermsOfService'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'))
const ShippingPolicy = lazy(() => import('./pages/ShippingPolicy'))
const RefundPolicy = lazy(() => import('./pages/RefundPolicy'))
const SunCare = lazy(() => import('./pages/Suncare'))
const Hairfall = lazy(() => import('./pages/Hairfall'))
const Acne = lazy(() => import('./pages/Acne'))
const Pigmentation = lazy(() => import('./pages/Pigmentation'))
const DullSkin = lazy(() => import('./pages/DullSkin'))
const Detan = lazy(() => import('./pages/Detan'))
const DamagedHair = lazy(() => import('./pages/DamagedHair'))
const Dandruff = lazy(() => import('./pages/Dandruff'))
const LipBalm = lazy(() => import('./pages/LipBalm'))
const HairCare1 = lazy(() => import('./pages/HairCare1'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const Cart = lazy(() => import('./pages/Cart'))
const Checkout = lazy(() => import('./pages/Checkout'))
const OrderSuccessPage = lazy(() => import('./pages/OrderSuccessPage'))
const SearchPage = lazy(() => import('./pages/SearchPage'))
const APIDebugPage = lazy(() => import('./pages/APIDebugPage'))
const TestPage = lazy(() => import('./pages/TestPage'))
const PixelTestPage = lazy(() => import('./pages/PixelTestPage'))
const AnalyticsDashboard = lazy(() => import('./pages/AnalyticsDashboard'))
const IncompletePurchases = lazy(() => import('./pages/IncompletePurchases'))
const NotFound = lazy(() => import('./pages/NotFound'))

// Component imports
import Header from './components/Header'
import Footer from './components/Footer'
import MobileMenu from './components/MobileMenu'
import DiscountSticker from './components/DiscountSticker'
import ScrollToTop from './components/ScrollToTop'


const ProfilePage = lazy(() => import('./components/ProfilePage'))
const CollectionBySlug = lazy(() => import('./pages/CollectionBySlug'))
import ProtectedRoute from './components/ProtectedRoute'
import CartSlide from './components/CartSlide'

// Constants
import { ROUTES } from './constants/routes'

// Fallback component for lazy loading
const PageLoader = () => (
  <div className="flex justify-center items-center h-screen">
    {/* Keep existing styles, just add loading indicator */}
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
  </div>
)

// Additional imports for password reset
const PasswordReset = lazy(() => import('./components/PasswordResetForm'))

// Menu item types
interface MenuItemBase {
  name: string;
}

interface MenuItemWithLink extends MenuItemBase {
  path: string;
  submenu?: undefined;
}

interface MenuItemWithSubmenu extends MenuItemBase {
  submenu: MenuItemWithLink[];
  path?: undefined;
}

type MenuItemType = MenuItemWithLink | MenuItemWithSubmenu;

const App = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const toggleCart = () => setIsCartOpen(!isCartOpen);
  const closeCart = () => setIsCartOpen(false);

  const closeAllSidebars = () => {
    closeMenu();
    closeCart();
  };

  // Add keyboard shortcut to close cart with escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCartOpen) {
        closeCart();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartOpen]);

  // Function to open cart when an item is added
  const openCartOnAdd = useCallback(() => {
    setIsCartOpen(true);
  }, []);

  // Set the global open cart function and listen for cart item added event to open the cart slide
  useEffect(() => {
    // Set the global function to open the cart
    setGlobalOpenCartFunction(openCartOnAdd);

    // Listen for cart item added event as backup
    const handleCartItemAdded = () => {
      setIsCartOpen(true);
    };

    window.addEventListener('cartItemAdded', handleCartItemAdded);

    return () => {
      window.removeEventListener('cartItemAdded', handleCartItemAdded);
      // Reset the global function on unmount
      setGlobalOpenCartFunction(() => {});
    };
  }, [openCartOnAdd]);

  const menuItems: MenuItemType[] = [
    { name: 'Home', path: ROUTES.HOME },
    { name: 'All Products', path: '/product-category/all-products' },
    {
      name: 'Shop By Category',
      submenu: [
        { name: 'Best Sellers', path: '/product-category/bestsellers' },
        { name: 'Sun Care', path: '/product-category/sun-care' },
        { name: 'Lip Balm', path: '/product-category/lip-balm' },
        { name: 'Hairfall', path: '/product-category/hairfall' },
        { name: 'Hair Care 1', path: '/product-category/hair-care-1' },
        { name: 'Acne & Acne Marks', path: '/product-category/acne' },
        { name: 'Pigmentation', path: '/product-category/pigmentation' },
        { name: 'Dull Skin', path: '/product-category/dull-skin' },
        { name: 'Detan', path: '/product-category/detan' },
        { name: 'Damaged Hair', path: '/product-category/damaged-hair' },
        { name: 'Dandruff', path: '/product-category/dandruff' },
      ],
    },
    { name: 'Our bestsellers hairgrowth serum 💫', path: '/products/13' },
    { name: 'lip balm sunscreens - trending 🚀', path: '/product-category/bestsellers/13' },
    { name: 'Head to sun toe protection 🌞', path: '/product-category/sun-care' },
    { name: 'BestSellers', path: '/product-category/bestsellers' },
    { name: 'New launches', path: '/product-category/bestsellers' },
  ];

  // Pass the cart functions down to components that need them
  return (
    <ThemeProvider>
      <ProductProvider>
        <OrderProvider>
          <div className="relative bg-[#E4EDFD] ">
            <SidebarProvider onCloseAll={closeAllSidebars}>
              {/* ✅ Reusable Mobile Menu */}
              <MobileMenu
                isOpen={isMenuOpen}
                onClose={closeMenu}
                menuItems={menuItems}
              />

              {/* Main Content */}
              <div className={`${isMenuOpen ? 'overflow-hidden' : ''}`}>
                {/* <Navigation /> */}
                {/* <Topbar /> */}
                <Header
                  toggleMenu={toggleMenu}
                  toggleCart={toggleCart}
                  isMenuOpen={isMenuOpen}
                />
                  <div className="">
                    <ErrorBoundary>
                      <Suspense fallback={<PageLoader />}>
                        <ScrollToTop />
                        <Routes>
                          <Route path={ROUTES.HOME} element={<Home />} />
                          <Route path={ROUTES.COLLECTIONS} element={<Collections />} />
                          <Route path={ROUTES.PAGES_ABOUT} element={<About />} />
                          <Route path={ROUTES.COLLECTIONS_ALL} element={<AllProducts />} />
                          <Route path={ROUTES.POLICIES_TERMS} element={<TermsOfService />} />
                          <Route path={ROUTES.POLICIES_PRIVACY} element={<PrivacyPolicy />} />
                          <Route path={ROUTES.POLICIES_SHIPPING} element={<ShippingPolicy />} />
                          <Route path={ROUTES.POLICIES_REFUND} element={<RefundPolicy />} />
                          <Route path={ROUTES.PRODUCT_DETAIL_SLUG} element={<ProductDetail />} />
                          <Route path={ROUTES.PRODUCT_DETAIL_ID_SLUG} element={<ProductDetail />} />
                          <Route path={ROUTES.PRODUCT_DETAIL} element={<ProductDetail />} />
                          <Route path={ROUTES.CART} element={<Cart />} />
                          <Route path={ROUTES.CHECKOUT} element={<Checkout />} />
                          <Route path={ROUTES.ORDER_SUCCESS} element={<OrderSuccessPage />} />
                          <Route path={ROUTES.SEARCH} element={<SearchPage />} />

                          <Route
                            path={ROUTES.PROFILE}
                            element={
                              <ProtectedRoute>
                                <ProfilePage />
                              </ProtectedRoute>
                            }
                          />
                          <Route path={ROUTES.API_DEBUG} element={<APIDebugPage />} />
                          <Route path={ROUTES.TEST_PAGE} element={<TestPage />} />
                          <Route path="/pixel-test" element={<PixelTestPage />} />
                          <Route path={ROUTES.ANALYTICS} element={<AnalyticsDashboard />} />
                          <Route path="/incomplete-purchases" element={<IncompletePurchases />} />

                          {/* Password Reset Route */}
                          <Route path="/reset-password" element={<PasswordReset />} />

                          {/* Redirect old collection routes to new product-category routes */}
                          <Route path={ROUTES.COLLECTIONS_BESTSELLERS} element={<Navigate to="/product-category/bestsellers" replace />} />
                          <Route path={ROUTES.COLLECTIONS_SUN_CARE} element={<Navigate to="/product-category/sun-care" replace />} />
                          <Route path={ROUTES.COLLECTIONS_LIP_BALM} element={<Navigate to="/product-category/lip-balm" replace />} />
                          <Route path={ROUTES.COLLECTIONS_HAIRFALL} element={<Navigate to="/product-category/hairfall" replace />} />
                          <Route path={ROUTES.COLLECTIONS_ACNE} element={<Navigate to="/product-category/acne" replace />} />
                          <Route path={ROUTES.COLLECTIONS_PIGMENTATION} element={<Navigate to="/product-category/pigmentation" replace />} />
                          <Route path={ROUTES.COLLECTIONS_DULL_SKIN} element={<Navigate to="/product-category/dull-skin" replace />} />
                          <Route path={ROUTES.COLLECTIONS_DETAN} element={<Navigate to="/product-category/detan" replace />} />
                          <Route path={ROUTES.COLLECTIONS_DAMAGED_HAIR} element={<Navigate to="/product-category/damaged-hair" replace />} />
                          <Route path={ROUTES.COLLECTIONS_DANDRUFF} element={<Navigate to="/product-category/dandruff" replace />} />
                          <Route path={ROUTES.COLLECTIONS_HAIR_CARE_1} element={<Navigate to="/product-category/hair-care-1" replace />} />
                          <Route path={ROUTES.COLLECTIONS_ALL} element={<Navigate to="/product-category/all-products" replace />} />

                          {/* New product-category routes - these should come after the redirects */}
                          <Route path="/product-category/bestsellers" element={
                            <div className='pb-10'><BestSellers /></div>
                          } />
                          <Route path="/product-category/sun-care" element={
                            <div className='pb-10'><SunCare /></div>
                          } />
                          <Route path="/product-category/lip-balm" element={
                            <div className='pb-10'><LipBalm /></div>
                          } />
                          <Route path="/product-category/hairfall" element={
                            <div className='pb-10'><Hairfall /></div>
                          } />
                          <Route path="/product-category/acne" element={
                            <div className='pb-10'><Acne /></div>
                          } />
                          <Route path="/product-category/pigmentation" element={
                            <div className='pb-10'><Pigmentation /></div>
                          } />
                          <Route path="/product-category/dull-skin" element={
                            <div className='pb-10'><DullSkin /></div>
                          } />
                          <Route path="/product-category/detan" element={
                            <div className='pb-10'><Detan /></div>
                          } />
                          <Route path="/product-category/damaged-hair" element={
                            <div className='pb-10'><DamagedHair /></div>
                          } />
                          <Route path="/product-category/dandruff" element={
                            <div className='pb-10'><Dandruff /></div>
                          } />
                          <Route path="/product-category/hair-care-1" element={
                            <div className='pb-10'><HairCare1 /></div>
                          } />
                          <Route path="/product-category/all-products" element={
                            <div className='pb-10'><AllProducts /></div>
                          } />

                          {/* Dynamic collection route - this should be placed before the wildcard route */}
                          <Route path="/product-category/:slug" element={
                            <div className='pb-10'><CollectionBySlug /></div>
                          } />

                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </Suspense>
                    </ErrorBoundary>
                  </div>
                  <Footer />
                  <DiscountSticker />
              </div>

              {/* Cart Slide - Positioned at app level to avoid navbar constraints */}
              <CartSlide isOpen={isCartOpen} onClose={closeCart} />
            </SidebarProvider>
          </div>

          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                padding: '16px',
                background: '#363636',
                color: '#fff',
              },
              duration: 4000, // Auto-dismiss after 4 seconds
            }}
            containerStyle={{
              top: 20,
              right: 20,
            }}
          />
        </OrderProvider>
      </ProductProvider>
    </ThemeProvider>
  );
};

export default App;

import { useState, lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'

// Contexts
import { ThemeProvider } from './contexts/ThemeContext';
import { ProductProvider } from './contexts/ProductContext';
import { OrderProvider } from './contexts/OrderContext';
import { SidebarProvider } from './contexts/SidebarContext';

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
const LipBalm = lazy(() => import('./pages/LipBalm'))
const HairCare1 = lazy(() => import('./pages/HairCare1'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const Cart = lazy(() => import('./pages/Cart'))
const Checkout = lazy(() => import('./pages/Checkout'))
const OrderSuccessPage = lazy(() => import('./pages/OrderSuccessPage'))
const SearchPage = lazy(() => import('./pages/SearchPage'))
const APIDebugPage = lazy(() => import('./pages/APIDebugPage'))
const TestPage = lazy(() => import('./pages/TestPage'))
const AnalyticsDashboard = lazy(() => import('./pages/AnalyticsDashboard'))

// Component imports
import Topbar from './components/Topbar'
import Header from './components/Header'
import Footer from './components/Footer'
import MobileMenu from './components/MobileMenu'


const ProfilePage = lazy(() => import('./components/ProfilePage'))
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

  const menuItems: MenuItemType[] = [
    { name: 'Home', path: ROUTES.HOME },
    { name: 'All Products', path: ROUTES.COLLECTIONS_ALL },
    {
      name: 'Shop By Category',
      submenu: [
        { name: 'Best Sellers', path: ROUTES.COLLECTIONS_BESTSELLERS },
        { name: 'Sun Care', path: ROUTES.COLLECTIONS_SUN_CARE },
        { name: 'Lip Balm', path: ROUTES.COLLECTIONS_LIP_BALM },
        { name: 'Hairfall', path: ROUTES.COLLECTIONS_HAIRFALL },
        { name: 'Hair Care 1', path: ROUTES.COLLECTIONS_HAIR_CARE_1 },
        { name: 'Acne & Acne Marks', path: ROUTES.COLLECTIONS_ACNE },
        { name: 'Pigmentation', path: ROUTES.COLLECTIONS_PIGMENTATION },
        { name: 'Dull Skin', path: ROUTES.COLLECTIONS_DULL_SKIN },
        { name: 'Detan', path: ROUTES.COLLECTIONS_DETAN },
        { name: 'Damaged Hair', path: ROUTES.COLLECTIONS_DAMAGED_HAIR },
      ],
    },
    { name: 'Our bestsellers hairgrowth serum 💫', path: '/products/13' },
    { name: 'lip balm sunscreens - trending 🚀', path: '/collections/bestsellers/13' },
    { name: 'Head to sun toe protection 🌞', path: ROUTES.COLLECTIONS_SUN_CARE },
    { name: 'BestSellers', path: ROUTES.COLLECTIONS_BESTSELLERS },
    { name: 'New launches', path: ROUTES.COLLECTIONS_BESTSELLERS },
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
                <Topbar />
                <Header 
                  toggleMenu={toggleMenu} 
                  toggleCart={toggleCart} 
                  isMenuOpen={isMenuOpen}
                />
                  <div className="">
                    <Suspense fallback={<PageLoader />}>
                      <Routes>
                        <Route path={ROUTES.HOME} element={<Home />} />
                        <Route path={ROUTES.COLLECTIONS} element={<Collections />} />
                        <Route path={ROUTES.PAGES_ABOUT} element={<About />} />
                        <Route path={ROUTES.COLLECTIONS_ALL} element={<AllProducts />} />
                        <Route path={ROUTES.POLICIES_TERMS} element={<TermsOfService />} />
                        <Route path={ROUTES.POLICIES_PRIVACY} element={<PrivacyPolicy />} />
                        <Route path={ROUTES.POLICIES_SHIPPING} element={<ShippingPolicy />} />
                        <Route path={ROUTES.POLICIES_REFUND} element={<RefundPolicy />} />
                        <Route path={ROUTES.PRODUCT_DETAIL_ID_SLUG} element={<ProductDetail />} />
                        <Route path={ROUTES.PRODUCT_DETAIL} element={<ProductDetail />} />
                        <Route path={ROUTES.PRODUCT_DETAIL_SLUG} element={<ProductDetail />} />
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
                        <Route path={ROUTES.ANALYTICS} element={<AnalyticsDashboard />} />
                      </Routes>
                      <div className='pb-10'>
                        <Routes>
                          <Route path={ROUTES.COLLECTIONS_BESTSELLERS} element={<BestSellers />} />
                        <Route path={ROUTES.COLLECTIONS_SUN_CARE} element={<SunCare />} />
                        <Route path={ROUTES.COLLECTIONS_LIP_BALM} element={<LipBalm />} />
                        <Route path={ROUTES.COLLECTIONS_HAIRFALL} element={<Hairfall />} />
                        <Route path={ROUTES.COLLECTIONS_ACNE} element={<Acne />} />
                        <Route path={ROUTES.COLLECTIONS_PIGMENTATION} element={<Pigmentation />} />
                        <Route path={ROUTES.COLLECTIONS_DULL_SKIN} element={<DullSkin />} />
                        <Route path={ROUTES.COLLECTIONS_DETAN} element={<Detan />} />
                        <Route path={ROUTES.COLLECTIONS_DAMAGED_HAIR} element={<DamagedHair />} />
                        <Route path={ROUTES.COLLECTIONS_HAIR_CARE_1} element={<HairCare1 />} />
                        </Routes>
                      </div>
                    </Suspense>
                  </div>
                  <Footer />
              </div>
              
              {/* Cart Slide - Positioned at app level to avoid navbar constraints */}
              <CartSlide isOpen={isCartOpen} onClose={closeCart} />
            </SidebarProvider>
          </div>
        </OrderProvider>
      </ProductProvider>
    </ThemeProvider>
  );
};

export default App;

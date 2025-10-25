import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import { useCartStore } from './store/cartStore'
import Home from './pages/Home'
import Topbar from './components/Topbar'
import Header from './components/Header'
import Footer from './components/Footer'
import Collections from './pages/Collections'
import BestSellers from './pages/BestSellers'
import About from './pages/About'
import AllProducts from './pages/AllProducts'
import TermsOfService from './pages/TermsOfService'
import PrivacyPolicy from './pages/PrivacyPolicy'
import ShippingPolicy from './pages/ShippingPolicy'
import RefundPolicy from './pages/RefundPolicy'
import SunCare from './pages/Suncare'
import Hairfall from './pages/Hairfall'
import Acne from './pages/Acne'
import Pigmentation from './pages/Pigmentation'
import DullSkin from './pages/DullSkin'
import Detan from './pages/Detan'
import DamagedHair from './pages/DamagedHair'
import MobileMenu from './components/MobileMenu'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import LoginForm from './components/LoginForm'
import UserProfile from './components/UserProfile'
import ProtectedRoute from './components/ProtectedRoute'
import CartSlide from './components/CartSlide'

import SearchPage from './pages/SearchPage'

const App = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const toggleCart = () => setIsCartOpen(!isCartOpen);
  const closeCart = () => setIsCartOpen(false);

  const menuItems = [
    { name: 'Home', path: '/' },
    { name: 'All Products', path: '/collections/all-products' },
    {
      name: 'Shop By Category',
      submenu: [
        { name: 'Best Sellers', path: '/collections/bestsellers' },
        { name: 'Sun Care', path: '/collections/sun-care' },
        { name: 'Hairfall', path: '/collections/hairfall' },
        { name: 'Acne & Acne Marks', path: '/collections/acne' },
        { name: 'Pigmentation', path: '/collections/pigmentation' },
        { name: 'Dull Skin', path: '/collections/dull-skin' },
        { name: 'Detan', path: '/collections/detan' },
        { name: 'Damaged Hair', path: '/collections/damaged-hair' },
      ],
    },
    {name: 'Our bestsellers hairgrowth serum 💫', path: '/collections/bestsellers/13'},
    {name: 'Head to sun toe protection 🌞', path: '/collections/sun-care'},
  ];

  // Pass the cart functions down to components that need them
  return (
    <div className="relative bg-[#E4EDFD]">
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
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/collections/bestsellers" element={<BestSellers />} />
            <Route path="/collections/sun-care" element={<SunCare />} />
            <Route path="/collections/hairfall" element={<Hairfall />} />
            <Route path="/collections/acne" element={<Acne />} />
            <Route path="/collections/pigmentation" element={<Pigmentation />} />
            <Route path="/collections/dull-skin" element={<DullSkin />} />
            <Route path="/collections/detan" element={<Detan />} />
            <Route path="/collections/damaged-hair" element={<DamagedHair />} />
            <Route path="/pages/about-us" element={<About />} />
            <Route path="/collections/all-products" element={<AllProducts />} />
            <Route path="/policies/terms-of-service" element={<TermsOfService />} />
            <Route path="/policies/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/policies/shipping-policy" element={<ShippingPolicy />} />
            <Route path="/policies/refund-policy" element={<RefundPolicy />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/search" element={<SearchPage />} />
            
            {/* Authentication Routes */}
            <Route path="/login" element={<LoginForm />} />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
        <Footer />
      </div>
      
      {/* Cart Slide - Positioned at app level to avoid navbar constraints */}
      <CartSlide isOpen={isCartOpen} onClose={closeCart} />
    </div>
  );
};

export default App;

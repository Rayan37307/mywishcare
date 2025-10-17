import React, { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
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
import MobileMenu from './components/MobileMenu'

const App = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const menuItems = [
    { name: 'Home', path: '/' },
    { name: 'All Products', path: '/collections/all-products' },
    {
      name: 'Shop By Category',
      submenu: [
        { name: 'Best Sellers', path: '/collections/bestsellers' },
        { name: 'Sun Care', path: '/collections/sun-care' },
        // Add more as needed
      ],
    },
    { name: 'Contact', path: '/contact' },
    { name: 'Cart', path: '/cart' },
  ];

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
        <Topbar />
        <Header toggleMenu={toggleMenu} />
        <div className="">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/collections/bestsellers" element={<BestSellers />} />
            <Route path="/collections/sun-care" element={<SunCare />} />
            <Route path="/pages/about-us" element={<About />} />
            <Route path="/collections/all-products" element={<AllProducts />} />
            <Route path="/policies/terms-of-service" element={<TermsOfService />} />
            <Route path="/policies/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/policies/shipping-policy" element={<ShippingPolicy />} />
            <Route path="/policies/refund-policy" element={<RefundPolicy />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default App;
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

const App = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  const menuItems = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
    { name: 'Cart', path: '/cart' },
  ]

  return (
    <div className='relative bg-[#E4EDFD]'>
      {/* Mobile Menu Sheet */}
      <div 
        className={`fixed inset-0 z-50 transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div 
          className="fixed inset-0 z-40"
          onClick={closeMenu}
        ></div>
        <div className="absolute top-0 left-0 w-64 h-full bg-white shadow-lg z-50">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Menu</h2>
              <button 
                className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                onClick={closeMenu}
                aria-label="Close menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <ul className="space-y-4">
              {menuItems.map((item, index) => (
                <li key={index}>
                  <a 
                    href={item.path}
                    className="block py-2 text-lg hover:text-[#D4F871] transition-colors"
                    onClick={closeMenu}
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`${isMenuOpen ? 'overflow-hidden' : ''}`}>
        <Topbar/>
        <Header toggleMenu={toggleMenu} />
        <div className=''>
          <Routes>
            <Route path='/' element={<Home/>}/>
            <Route path="/collections" element={<Collections/>} />
            <Route path="/collections/bestsellers" element={<BestSellers/>} />
            <Route path='/pages/about-us' element={<About />} />
            <Route path="/collections/all-products" element={<AllProducts />} />
            <Route path='/policies/terms-of-service' element={ <TermsOfService />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </div>
  )
}

export default App
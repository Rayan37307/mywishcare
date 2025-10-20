import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaSearch, FaShoppingCart, FaBars, FaTimes } from 'react-icons/fa';
import { useCartStore } from '../store/cartStore';
import CartSlide from './CartSlide';
import SearchBar from './SearchBar';

interface NavbarProps {
  toggleMenu?: () => void;
}

const Navbar = ({ toggleMenu }: NavbarProps) => {
  const { totalItems } = useCartStore();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const navigate = useNavigate();
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  const closeCart = () => {
    setIsCartOpen(false);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
  };

  const handleSearchSubmit = (searchTerm: string) => {
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
      setIsSearchOpen(false);
    }
  };

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        closeSearch();
      }
    };

    if (isSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchOpen]);

  return (
    <nav className="bg-[#E4EDFD] py-8 px-6 relative">
      <div className="flex items-center justify-between">
        {/* Left: Menu Button */}
        <div className="flex items-center">
          <button 
            className="p-2 rounded-md focus:outline-none transition-colors duration-200"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <svg aria-hidden="true" fill="none" focusable="false" width="24" viewBox="0 0 24 24">
      <path d="M1 19h22M1 12h22M1 5h22" stroke="currentColor" stroke-width="1.5" stroke-linecap="square"></path>
    </svg>
          </button>
        </div>

        {/* Middle: Logo */}
        <div className="flex items-center justify-center">
          <img 
            src="/logo.webp" 
            alt="MyWishCare Logo" 
            className="h-8 w-auto object-contain"
          />
        </div>

        {/* Right: User, Search, Cart */}
        <div className="flex items-center space-x-5">
          <button className="p-2 rounded-md transition-colors duration-200">
            <svg width="25" height="25" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg" id="svgkp">
      <path d="M22.9129 12.935L13.7571 23.0474C13.5348 23.2929 13.1284 23.1084 13.1669 22.7794L14.0816 14.9731H10.6991C10.4034 14.9731 10.2484 14.6219 10.4478 14.4035L20.3133 3.59739C20.5589 3.32834 20.9984 3.58134 20.8891 3.92887L18.2354 12.3664H22.6607C22.9557 12.3664 23.1109 12.7163 22.9129 12.935Z" fill="#FEA203"></path>
      <path id="svgkp-path" fill-rule="evenodd" clip-rule="evenodd" d="M16.6079 5.35819C16.4805 5.1933 16.3421 5.03582 16.1932 4.8869C15.2702 3.96387 14.0183 3.44531 12.7129 3.44531C11.4075 3.44531 10.1556 3.96387 9.2326 4.8869C8.30957 5.80993 7.79102 7.06183 7.79102 8.36719C7.79102 9.67255 8.30957 10.9244 9.2326 11.8475C9.48368 12.0986 9.75909 12.3197 10.0533 12.5086L11.0235 11.4503C10.7335 11.2914 10.4649 11.0911 10.227 10.8531C9.56766 10.1938 9.19727 9.29959 9.19727 8.36719C9.19727 7.43479 9.56766 6.54057 10.227 5.88127C10.8863 5.22196 11.7805 4.85156 12.7129 4.85156C13.6453 4.85156 14.5395 5.22196 15.1988 5.88127C15.3636 6.04604 15.5103 6.22549 15.6377 6.41654L16.6079 5.35819ZM20.6413 18.6497L19.6746 19.7132C20.1676 20.4122 20.4473 21.2264 20.4473 22.0781V23.8359C20.4473 24.2243 20.7621 24.5391 21.1504 24.5391C21.5387 24.5391 21.8535 24.2243 21.8535 23.8359V22.0781C21.8535 20.7863 21.4016 19.6103 20.6413 18.6497ZM12.3111 17.5078H10.3026C7.27113 17.5078 4.97852 19.6394 4.97852 22.0781V23.8359C4.97852 24.2243 4.66372 24.5391 4.27539 24.5391C3.88707 24.5391 3.57227 24.2243 3.57227 23.8359V22.0781C3.57227 18.6922 6.67684 16.1016 10.3026 16.1016H12.4885L12.3111 17.5078Z" fill="currentColor" stroke="currentColor"></path>
      </svg>
          </button>
          
          <button 
            className="p-2 rounded-md transition-colors duration-200"
            onClick={toggleSearch}
            aria-label="Open search"
          >
            <svg aria-hidden="true" fill="none" focusable="false" width="24" viewBox="0 0 24 24">
      <path d="M10.364 3a7.364 7.364 0 1 0 0 14.727 7.364 7.364 0 0 0 0-14.727Z" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10"></path>
      <path d="M15.857 15.858 21 21.001" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round"></path>
    </svg>
          </button>
          
          <button 
            className="p-2 rounded-md relative transition-colors duration-200"
            onClick={toggleCart}
            aria-label="Open cart"
          >
            <svg aria-hidden="true" fill="none" focusable="false" width="24" viewBox="0 0 24 24"><path d="M4.75 8.25A.75.75 0 0 0 4 9L3 19.125c0 1.418 1.207 2.625 2.625 2.625h12.75c1.418 0 2.625-1.149 2.625-2.566L20 9a.75.75 0 0 0-.75-.75H4.75Zm2.75 0v-1.5a4.5 4.5 0 0 1 4.5-4.5v0a4.5 4.5 0 0 1 4.5 4.5v1.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
      
      {/* Cart Slide */}
      <CartSlide isOpen={isCartOpen} onClose={closeCart} />
      
      {/* Search Bar - Full width overlay */}
      {isSearchOpen && (
        <div 
          ref={searchContainerRef}
          className="fixed top-0 left-0 right-0 bg-white shadow-lg z-50 py-8 -mx-6 px-6"
        >
          <SearchBar 
            onSubmit={handleSearchSubmit} 
            autoFocus={true}
          />
        </div>
      )}
    </nav>
  );
};

export default Navbar;
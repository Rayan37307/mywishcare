import { useState, useEffect, memo } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Navbar from './Navbar';
import OTPAuthModal from './OTPAuthModal';

interface HeaderProps {
  toggleMenu?: () => void;
  toggleCart?: () => void;
  isMenuOpen?: boolean;
}

const Header = memo(({ toggleMenu, toggleCart, isMenuOpen }: HeaderProps) => {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  // Add a small bottom border when on homepage and not scrolled for visual separation
  const isHome = location.pathname === '/';
  const headerClass = isHome 
    ? "sticky top-0 z-30" 
    : "sticky top-0 z-30 bg-[#E4EDFD]";

  const handleUserIconClick = () => {
    if (isAuthenticated && user) {
      // If user is already authenticated, you might navigate to profile
      // For now, we'll just close any open modals if needed
    } else {
      // If not authenticated, open the OTP auth modal
      setIsAuthModalOpen(true);
    }
  };

  // Listen for the custom event to open auth modal
  useEffect(() => {
    const handleOpenAuthModal = () => {
      if (!isAuthenticated) {  // Only open if user is not authenticated
        setIsAuthModalOpen(true);
      }
    };

    window.addEventListener('openAuthModal', handleOpenAuthModal);
    
    return () => {
      window.removeEventListener('openAuthModal', handleOpenAuthModal);
    };
  }, [isAuthenticated]);

  return (
    <>
      <header className={headerClass}>
        <Navbar
          toggleMenu={toggleMenu}
          toggleCart={toggleCart}
          isMenuOpen={isMenuOpen}
          onUserIconClick={handleUserIconClick}
        />
      </header>
      
      {/* OTP Authentication Modal */}
      <OTPAuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </>
  );
});

Header.displayName = 'Header';

export default Header;
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';

interface HeaderProps {
  toggleMenu?: () => void;
  toggleCart?: () => void;
  isMenuOpen?: boolean;
}

const Header = ({ toggleMenu, toggleCart, isMenuOpen }: HeaderProps) => {
  const location = useLocation();
  
  // Add a small bottom border when on homepage and not scrolled for visual separation
  const isHome = location.pathname === '/';
  const headerClass = isHome 
    ? "sticky top-0 z-30" 
    : "sticky top-0 z-30 bg-[#E4EDFD]";

  return (
    <header className={headerClass}>
      <Navbar toggleMenu={toggleMenu} toggleCart={toggleCart} isMenuOpen={isMenuOpen} />
    </header>
  );
};

export default Header;
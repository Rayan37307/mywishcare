import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';

interface HeaderProps {
  toggleMenu?: () => void;
}

const Header = ({ toggleMenu }: HeaderProps) => {
  const location = useLocation();
  
  // Add a small bottom border when on homepage and not scrolled for visual separation
  const isHome = location.pathname === '/';
  const headerClass = isHome 
    ? "sticky top-0 z-40" 
    : "sticky top-0 z-40 bg-[#E4EDFD]";

  return (
    <header className={headerClass}>
      <Navbar toggleMenu={toggleMenu} />
    </header>
  );
};

export default Header;
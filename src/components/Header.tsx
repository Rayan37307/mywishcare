import Navbar from './Navbar';

interface HeaderProps {
  toggleMenu?: () => void;
}

const Header = ({ toggleMenu }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-40">
      <Navbar toggleMenu={toggleMenu} />
    </header>
  );
};

export default Header;
// components/MobileMenu.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMediaQuery } from '../hooks/useMediaQuery'; // adjust path as needed

// Types (same as before)
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

export type MenuItem = MenuItemWithLink | MenuItemWithSubmenu;

interface MenuItemProps {
  item: MenuItem;
  onNavigate: (action: 'close' | 'openSubmenu' | 'goBack', payload?: MenuItemWithSubmenu) => void;
  level?: number;
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
}

const MenuItem: React.FC<MenuItemProps> = ({ item, onNavigate, level = 0 }) => {
  const hasSubmenu = 'submenu' in item && Array.isArray(item.submenu) && item.submenu.length > 0;

  if (hasSubmenu) {
    return (
      <li>
        <button
          onClick={() => onNavigate('openSubmenu', item as MenuItemWithSubmenu)}
          className="flex justify-between items-center w-full py-3 font-bold text-sm text-left hover:text-gray-600 transition-colors"
          aria-haspopup="true"
        >
          {item.name}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        {level === 0 && <hr className="border-gray-300 mt-2" />}
      </li>
    );
  }

  return (
    <li>
      <Link
        to={(item as MenuItemWithLink).path}
        className="block py-3 font-bold text-sm text-lg hover:text-gray-600 transition-colors"
        onClick={() => onNavigate('close')}
      >
        {item.name}
      </Link>
      {level === 0 && <hr className="border-gray-300 mt-2" />}
    </li>
  );
};

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, menuItems }) => {
  const [currentSubmenu, setCurrentSubmenu] = useState<MenuItemWithSubmenu | null>(null);
  const isLargeScreen = useMediaQuery('(min-width: 640px)'); // sm breakpoint

  const handleNavigate = (
    action: 'close' | 'openSubmenu' | 'goBack',
    payload?: MenuItemWithSubmenu
  ) => {
    if (action === 'close') {
      setCurrentSubmenu(null);
      onClose();
    } else if (action === 'openSubmenu') {
      setCurrentSubmenu(payload || null);
    } else if (action === 'goBack') {
      setCurrentSubmenu(null);
    }
  };

  // On small screens, if submenu is open, show only submenu
  const showMainMenu = !currentSubmenu || (currentSubmenu && isLargeScreen);
  const showSubmenu = currentSubmenu != null;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/25 transition-opacity duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Main Menu — hidden on small screens when submenu is open */}
      {showMainMenu && (
        <div
          className={`fixed top-0 left-0 z-50 h-full w-full sm:w-96 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={onClose}
                aria-label="Close menu"
                className="p-1 rounded-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <ul className="space-y-1 flex-1 overflow-y-auto">
              {menuItems.map((item, index) => (
                <MenuItem
                  key={index}
                  item={item}
                  onNavigate={handleNavigate}
                  level={0}
                />
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Submenu */}
      {showSubmenu && (
        <div
          className={`fixed top-0 z-50 h-full w-full ${
            isLargeScreen ? 'left-64 w-64' : 'left-0'
          } bg-white shadow-lg transform transition-transform duration-300 ease-in-out translate-x-0`}
        >
          <div className="p-6 h-full flex flex-col">
            {/* Back button (always shown on small screens; optional on large) */}
            <div className="flex items-center mb-6">
              <button
                onClick={() => handleNavigate('goBack')}
                aria-label="Go back to menu"
                className="p-1 rounded-md hover:bg-gray-100 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                {!isLargeScreen && <span className="ml-2">Back to Menu</span>}
              </button>
              {isLargeScreen && <h2 className="text-lg font-medium ml-2">{currentSubmenu.name}</h2>}
            </div>

            <ul className="space-y-1 flex-1">
              {currentSubmenu!.submenu.map((subItem, idx) => (
                <li key={idx}>
                  <Link
                    to={subItem.path}
                    className="block py-2 text-lg hover:text-gray-600 transition-colors"
                    onClick={onClose}
                  >
                    {subItem.name}
                  </Link>
                  {idx !== currentSubmenu!.submenu.length - 1 && (
                    <hr className="border-gray-300 mt-2" />
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileMenu;

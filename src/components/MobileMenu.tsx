// components/MobileMenu.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { useAuth } from "../hooks/useAuth";
import { User } from "lucide-react";

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
  onNavigate: (
    action: "close" | "openSubmenu" | "goBack",
    payload?: MenuItemWithSubmenu
  ) => void;
  level?: number;
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
}

const MenuItem: React.FC<MenuItemProps> = ({ item, onNavigate, level = 0 }) => {
  const hasSubmenu =
    "submenu" in item && Array.isArray(item.submenu) && item.submenu.length > 0;

  if (hasSubmenu) {
    return (
      <li>
        <button
          onClick={() => onNavigate("openSubmenu", item as MenuItemWithSubmenu)}
          className="flex justify-between items-center w-full py-3 text-sm hover:text-gray-600 transition-colors"
        >
          {item.name}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
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
        className="block py-3 text-lg hover:text-gray-600 transition-colors"
        onClick={() => onNavigate("close")}
      >
        {item.name}
      </Link>
      {level === 0 && <hr className="border-gray-300 mt-2" />}
    </li>
  );
};

const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  menuItems,
}) => {
  const [currentSubmenu, setCurrentSubmenu] =
    useState<MenuItemWithSubmenu | null>(null);
  const isLargeScreen = useMediaQuery("(min-width: 640px)");
  const { user } = useAuth();

  const handleNavigate = (
    action: "close" | "openSubmenu" | "goBack",
    payload?: MenuItemWithSubmenu
  ) => {
    if (action === "close") {
      setCurrentSubmenu(null);
      onClose();
    } else if (action === "openSubmenu") {
      setCurrentSubmenu(payload || null);
    } else if (action === "goBack") {
      setCurrentSubmenu(null);
    }
  };

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

      {/* Main Menu */}
      {showMainMenu && (
        <div
          className={`fixed top-0 left-0 z-50 h-full w-full sm:w-96 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="p-6 h-full flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={onClose}
                aria-label="Close menu"
                className="p-1 rounded-md"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Menu Items */}
            <ul className="space-y-3 flex-1 overflow-y-auto uppercase">
              {menuItems.map((item, index) => (
                <MenuItem
                  key={index}
                  item={item}
                  onNavigate={handleNavigate}
                  level={0}
                />
              ))}
            </ul>

            {/* Account / Login button */}
            <div className="mt-auto pt-4 border-t border-gray-200 block md:hidden">
              {user ? (
                <Link
                  to="/account"
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 w-full bg-[#111827] text-white py-3 rounded-md font-medium hover:bg-[#1f2937] transition-colors"
                >
                  <User size={18} />
                  <span>Account</span>
                </Link>
              ) : (
                <button
                  onClick={() => {
                    onClose();
                    // This will trigger the auth modal through the Header component
                    const event = new CustomEvent('openAuthModal');
                    window.dispatchEvent(event);
                  }}
                  className="block w-full text-center bg-[#D4F871] text-black py-3 rounded-md font-medium hover:bg-[#c1e05a] transition-colors"
                >
                  Log In
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Submenu */}
      {showSubmenu && (
        <div
          className={`fixed top-0 z-50 h-full w-full ${
            isLargeScreen ? "left-96 w-96" : "left-0"
          } bg-white shadow-lg transform transition-transform duration-300 ease-in-out translate-x-0`}
        >
          <div className="p-6 h-full flex flex-col">
            {/* Back button */}
            <div className="flex items-center mb-6">
              <button
                onClick={() => handleNavigate("goBack")}
                aria-label="Go back to menu"
                className="p-1 rounded-md hover:bg-gray-100 flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                {!isLargeScreen && <span className="ml-2">Back</span>}
              </button>
              {isLargeScreen && (
                <h2 className="text-lg font-medium ml-2">
                  {currentSubmenu?.name}
                </h2>
              )}
            </div>

            <ul className="space-y-1 flex-1 uppercase">
              {currentSubmenu?.submenu.map((subItem, idx) => (
                <li key={idx}>
                  <Link
                    to={subItem.path}
                    className="block py-2 text-lg hover:text-gray-600 transition-colors"
                    onClick={onClose}
                  >
                    {subItem.name}
                  </Link>
                  {idx !== currentSubmenu.submenu.length - 1 && (
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

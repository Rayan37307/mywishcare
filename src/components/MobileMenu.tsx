import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { useAuth } from "../hooks/useAuth";
import { User } from "lucide-react";
import { useSidebar } from "../contexts/SidebarContext";
import { gsap } from "gsap";

// ===================== TYPES ===================== //
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

// ===================== MENU ITEM ===================== //
interface MenuItemProps {
  item: MenuItem;
  onNavigate: (action: "close" | "openSubmenu" | "goBack", payload?: MenuItemWithSubmenu) => void;
  closeAllSidebars: () => void;
  level?: number;
  index?: number;
  isOpen?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({
  item,
  onNavigate,
  closeAllSidebars,
  level = 0,
  index = 0,
  isOpen = false,
}) => {
  const ref = useRef<HTMLLIElement>(null);
  const firstRender = useRef(true);
  const hasSubmenu = "submenu" in item && Array.isArray(item.submenu);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (ref.current && isOpen) {
      gsap.fromTo(
        ref.current,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.35, delay: level * 0.05 + index * 0.1, ease: "power2.out" }
      );
    }
  }, [isOpen, level, index]);

  return (
    <li ref={ref}>
      {hasSubmenu ? (
        <button
          onClick={() => onNavigate("openSubmenu", item as MenuItemWithSubmenu)}
          className="flex justify-between items-center w-full py-2 text-[13px] font-semibold hover:text-gray-600 transition-colors"
        >
          {item.name}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      ) : (
        <Link
          to={(item as MenuItemWithLink).path}
          onClick={() => {
            closeAllSidebars();
            onNavigate("close");
          }}
          className="block py-2 text-[13px] font-semibold hover:text-gray-600 transition-colors"
        >
          {item.name}
        </Link>
      )}
      {level === 0 && <hr className="border-gray-300 mt-2" />}
    </li>
  );
};

// ===================== SUBMENU ITEM ===================== //
interface AnimatedSubmenuItemProps {
  subItem: MenuItemWithLink;
  idx: number;
  currentSubmenu: MenuItemWithSubmenu | null;
  closeAllSidebars: () => void;
  onClose: () => void;
  isOpen: boolean;
}

const AnimatedSubmenuItem: React.FC<AnimatedSubmenuItemProps> = ({
  subItem,
  idx,
  currentSubmenu,
  closeAllSidebars,
  onClose,
  isOpen,
}) => {
  const ref = useRef<HTMLLIElement>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (ref.current && isOpen) {
      gsap.fromTo(
        ref.current,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.3, delay: idx * 0.1, ease: "power2.out" }
      );
    }
  }, [idx, isOpen]);

  return (
    <li ref={ref}>
      <Link
        to={subItem.path}
        className="block py-3 text-[13px] font-semibold hover:text-gray-600 transition-colors"
        onClick={() => {
          closeAllSidebars();
          onClose();
        }}
      >
        {subItem.name}
      </Link>
      {idx !== currentSubmenu!.submenu.length - 1 && <hr className="border-gray-300 mt-2" />}
    </li>
  );
};

// ===================== MAIN MENU ===================== //
interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, menuItems }) => {
  const [currentSubmenu, setCurrentSubmenu] = useState<MenuItemWithSubmenu | null>(null);
  const isLargeScreen = useMediaQuery("(min-width: 640px)");
  const { user } = useAuth();
  const { closeAllSidebars } = useSidebar();

  const mainRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

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

  const showMainMenu = !currentSubmenu || isLargeScreen;
  const showSubmenu = !!currentSubmenu;

  // 🌀 Main menu animation
  useEffect(() => {
    if (!mainRef.current) return;

    if (firstRender.current) {
      firstRender.current = false;
      gsap.set(mainRef.current, { x: "-100%" });
      return;
    }

    gsap.to(mainRef.current, {
      x: isOpen ? 0 : "-100%",
      duration: 0.4,
      ease: "power2.out",
    });
  }, [isOpen]);

  // 🌀 Submenu animation
  useEffect(() => {
    if (!subRef.current) return;

    if (showSubmenu) {
      gsap.fromTo(
        subRef.current,
        { x: isLargeScreen ? "100%" : "100%" },
        { x: 0, duration: 0.4, ease: "power2.out" }
      );
    } else {
      gsap.to(subRef.current, {
        x: isLargeScreen ? "100%" : "100%",
        duration: 0.3,
        ease: "power2.in",
      });
    }
  }, [showSubmenu, isLargeScreen]);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/25 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* 🧭 Main Menu */}
      {showMainMenu && (
        <div
          ref={mainRef}
          className="fixed top-0 left-0 z-50 h-full w-full sm:w-96 bg-white shadow-lg"
        >
          <div className="p-7 h-full flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <button onClick={onClose} className="p-1 rounded-md hover:bg-gray-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <ul className="space-y-4 flex-1 overflow-y-auto uppercase text-[10px]">
              {menuItems.map((item, i) => (
                <MenuItem
                  key={i}
                  item={item}
                  onNavigate={handleNavigate}
                  closeAllSidebars={closeAllSidebars}
                  level={0}
                  index={i}
                  isOpen={isOpen}
                />
              ))}
            </ul>

            <div className="mt-auto pt-4 border-t border-gray-200 block md:hidden">
              {user ? (
                <Link
                  to="/account"
                  onClick={() => {
                    closeAllSidebars();
                    onClose();
                  }}
                  className="flex items-center justify-center gap-2 w-full bg-[#111827] text-white py-3 rounded-md font-medium hover:bg-[#1f2937] transition-colors"
                >
                  <User size={18} /> <span>Account</span>
                </Link>
              ) : (
                <button
                  onClick={() => {
                    closeAllSidebars();
                    onClose();
                    window.dispatchEvent(new CustomEvent("openAuthModal"));
                  }}
                  className="w-full bg-[#D4F871] text-black py-3 rounded-md font-medium hover:bg-[#c1e05a] transition-colors"
                >
                  Log In
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 📂 Submenu */}
      {showSubmenu && (
        <div
          ref={subRef}
          className={`fixed top-0 z-50 h-full ${
            isLargeScreen ? "left-96 w-96" : "left-0 w-full"
          } bg-white shadow-lg`}
        >
          <div className="p-4 h-full flex flex-col">
            <div className="flex items-center mb-4">
              <button
                onClick={() => handleNavigate("goBack")}
                className="p-0.5 rounded-md hover:bg-gray-100 flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                {!isLargeScreen && <span className="ml-2 text-sm">Back</span>}
              </button>
              {isLargeScreen && (
                <h2 className="text-base font-medium ml-2">{currentSubmenu?.name}</h2>
              )}
            </div>

            <ul className="space-y-1 flex-1 uppercase">
              {currentSubmenu?.submenu.map((subItem, idx) => (
                <AnimatedSubmenuItem
                  key={idx}
                  subItem={subItem}
                  idx={idx}
                  currentSubmenu={currentSubmenu}
                  closeAllSidebars={closeAllSidebars}
                  onClose={onClose}
                  isOpen={isOpen}
                />
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileMenu;

import { useState, useEffect, useRef, memo } from 'react';

interface UserDropdownProps {
  user: any;
  navigate: any;
  handleLogout: () => void;
}

const UserDropdown: React.FC<UserDropdownProps> = memo(({ user, navigate, handleLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen(!isOpen);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleProfileKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      navigate('/profile');
      setIsOpen(false);
    }
  };

  const handleOrdersKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      navigate('/profile#orders');
      setIsOpen(false);
    }
  };

  const handleLogoutKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleLogout();
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        className="p-2 rounded-md transition-colors duration-200 cursor-pointer flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User menu"
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-medium">
          {user.displayName?.charAt(0)?.toUpperCase() || user.username?.charAt(0)?.toUpperCase()}
        </div>
      </button>
      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="user-menu"
        >
          <button 
            onClick={() => {
              navigate('/profile');
              setIsOpen(false);
            }}
            onKeyDown={handleProfileKeyDown}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left focus:outline-none focus:bg-gray-100"
            role="menuitem"
          >
            Your Profile
          </button>
          <button 
            onClick={() => {
              navigate('/profile#orders');
              setIsOpen(false);
            }}
            onKeyDown={handleOrdersKeyDown}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left focus:outline-none focus:bg-gray-100"
            role="menuitem"
          >
            Order History
          </button>
          <button 
            onClick={() => {
              handleLogout();
              setIsOpen(false);
            }}
            onKeyDown={handleLogoutKeyDown}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left focus:outline-none focus:bg-gray-100"
            role="menuitem"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
});

UserDropdown.displayName = 'UserDropdown';

export default UserDropdown;
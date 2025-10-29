import React from 'react';
import { Link } from 'react-router-dom';
import type { LinkProps } from 'react-router-dom';
import { useSidebar } from '../contexts/SidebarContext';

const SidebarAwareLink: React.FC<LinkProps> = ({ onClick, ...props }) => {
  const { closeAllSidebars } = useSidebar();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    closeAllSidebars();
    onClick?.(e);
  };

  return <Link onClick={handleClick} {...props} />;
};

export default SidebarAwareLink;
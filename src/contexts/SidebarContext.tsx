import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';

interface SidebarContextType {
  closeAllSidebars: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider: React.FC<{ 
  children: ReactNode; 
  onCloseAll: () => void; 
}> = ({ children, onCloseAll }) => {
  return (
    <SidebarContext.Provider value={{ closeAllSidebars: onCloseAll }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};
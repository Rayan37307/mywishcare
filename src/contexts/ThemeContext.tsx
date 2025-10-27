// Context to provide theme configuration to the app
import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';

interface ThemeContextType {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const theme: ThemeContextType = {
    primaryColor: '#D4F871', // Green background for buttons
    secondaryColor: '#373737', // Dark gray for footer
    accentColor: '#E4EDFD', // Light blue background
    backgroundColor: '#FFFFFF', // White background
    textColor: '#000000', // Black text
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
import React, { createContext, useState, useContext, useEffect } from 'react';
import { COLORS } from '@/constants/Colors';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  theme: typeof COLORS;
}

const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: true,
  toggleTheme: () => {},
  theme: COLORS,
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // In a real app, we'd have light and dark color schemes
  // For this demo, we always use dark mode
  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };
  
  return (
    <ThemeContext.Provider 
      value={{
        isDarkMode,
        toggleTheme,
        theme: COLORS,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
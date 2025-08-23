'use client';

import type React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isLoading: boolean; // Add loading state
}

interface ThemeProviderProps {
  children: React.ReactNode;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Helper function to safely access localStorage
const getStoredTheme = (): Theme | null => {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem('theme');
    return saved === 'light' || saved === 'dark' ? saved : null;
  } catch {
    return null;
  }
};

const setStoredTheme = (theme: Theme): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('theme', theme);
  } catch {
    // Silently fail if localStorage is not available
  }
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('dark');
  const [isLoading, setIsLoading] = useState(true);

  // Initialize theme on client side only
  useEffect(() => {
    const savedTheme = getStoredTheme();
    if (savedTheme) {
      setTheme(savedTheme);
    }
    setIsLoading(false);
  }, []);

  // Update localStorage and DOM when theme changes
  useEffect(() => {
    if (isLoading) return; // Don't update during initial load

    setStoredTheme(theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme, isLoading]);

  const toggleTheme = (): void => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const contextValue: ThemeContextType = {
    theme,
    toggleTheme,
    isLoading,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
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

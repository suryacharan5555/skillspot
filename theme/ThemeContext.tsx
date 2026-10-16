import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useLocalStorage<Theme>('skillspot_theme', 'light');

  const applyTheme = (t: Theme) => {
    const root = window.document.documentElement;
    const body = window.document.body;
    root.classList.remove('light', 'dark');
    root.classList.add(t);
    if (body) {
      body.classList.remove('light', 'dark');
      body.classList.add(t);
    }
    root.style.colorScheme = t;
    try {
      if ((window as any).tailwind && typeof (window as any).tailwind.refresh === 'function') {
        (window as any).tailwind.refresh();
      }
    } catch (_) {}
  };

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme: Theme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    applyTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
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
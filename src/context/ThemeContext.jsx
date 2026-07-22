import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { settingsService } from '../services/index';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => settingsService.get().theme || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    settingsService.save({ theme });
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setThemeState((t) => (t === 'light' ? 'dark' : 'light'));
  }, []);

  const setTheme = useCallback((t) => setThemeState(t), []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

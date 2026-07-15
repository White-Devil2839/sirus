import { createContext, useContext, useEffect, useState, useCallback } from 'react';

// Theme switching = one data-theme attribute on <html>. Tailwind tokens read
// CSS variables, so the entire app re-skins with zero React re-render.
export const THEMES = [
  { id: 'paper', name: 'Paper', hint: 'Warm daylight', swatch: '#F8F7F3', accent: '#5b45f0' },
  { id: 'dusk', name: 'Dusk', hint: 'Evening warmth', swatch: '#FAF3EB', accent: '#c2410c' },
  { id: 'nocturne', name: 'Nocturne', hint: 'Deep indigo dark', swatch: '#131220', accent: '#8e7dff' },
];

const STORAGE_KEY = 'sirus:theme';
const ThemeContext = createContext(null);

function applyTheme(id) {
  document.documentElement.dataset.theme = id;
  // Sync the mobile browser chrome with the paper color.
  const meta = document.querySelector('meta[name="theme-color"]');
  const paper = getComputedStyle(document.documentElement).getPropertyValue('--paper').trim();
  if (meta && paper) meta.setAttribute('content', `rgb(${paper.split(' ').join(',')})`);
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return THEMES.some((t) => t.id === saved) ? saved : 'paper';
    } catch {
      return 'paper';
    }
  });

  useEffect(() => applyTheme(theme), [theme]);

  const setTheme = useCallback((id) => {
    if (!THEMES.some((t) => t.id === id)) return;
    setThemeState(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch { /* private mode */ }
  }, []);

  const cycle = useCallback(() => {
    setThemeState((cur) => {
      const idx = THEMES.findIndex((t) => t.id === cur);
      const next = THEMES[(idx + 1) % THEMES.length].id;
      try { localStorage.setItem(STORAGE_KEY, next); } catch { /* ignore */ }
      return next;
    });
  }, []);

  return <ThemeContext.Provider value={{ theme, setTheme, cycle, themes: THEMES }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);

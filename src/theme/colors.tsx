import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const lightColors = {
  background: '#FDFCF8',
  surface: '#F8F5EB',
  textPrimary: '#171717',
  textSecondary: '#525252',
  textMuted: '#A3A3A3',
  border: '#E7E5DF',
  error: '#DC2626',
  accent: '#171717',
};

export const darkColors = {
  background: '#000000',
  surface: '#121212',
  textPrimary: '#FFFFFF',
  textSecondary: '#A3A3A3',
  textMuted: '#525252',
  border: '#262626',
  error: '#EF4444',
  accent: '#FFFFFF',
};

export const emotions = {
  intro: '#0F766E',
  focus: '#0369A1',
  story: '#B45309',
  climax: '#BE123C',
  transition: '#6D28D9',
  neutral: '#475569',
};

export const geometry = {
  radius: 4,
};

export type Theme = {
  isDark: boolean;
  colors: typeof lightColors;
  emotions: typeof emotions;
  geometry: typeof geometry;
};

export const theme: Theme = {
  isDark: false,
  colors: lightColors,
  emotions,
  geometry,
};

export type ThemeMode = 'light' | 'dark' | 'auto';

type ThemeContextType = {
  theme: Theme;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>('auto');

  useEffect(() => {
    AsyncStorage.getItem('themeMode').then(saved => {
      if (saved) setMode(saved as ThemeMode);
    });
  }, []);

  const handleSetMode = (newMode: ThemeMode) => {
    setMode(newMode);
    AsyncStorage.setItem('themeMode', newMode);
  };

  const isDark = mode === 'auto' ? systemScheme === 'dark' : mode === 'dark';

  const themeObj: Theme = {
    isDark,
    colors: isDark ? darkColors : lightColors,
    emotions,
    geometry,
  };

  return (
    <ThemeContext.Provider value={{ theme: themeObj, mode, setMode: handleSetMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within ThemeProvider');
  }
  return context;
}

export function useTheme(): Theme {
  const context = useContext(ThemeContext);
  if (!context) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    return {
      isDark,
      colors: isDark ? darkColors : lightColors,
      emotions,
      geometry,
    };
  }
  return context.theme;
}

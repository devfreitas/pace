import { useColorScheme } from 'react-native';

export const lightColors = {
  background: '#F8FAFC',
  surface: '#F1F5F9',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  error: '#DC2626',
  accent: '#0284C7',
};

export const darkColors = {
  background: '#0F172A',
  surface: '#1E293B',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#475569',
  border: '#334155',
  error: '#EF4444',
  accent: '#38BDF8',
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

// Static export for fallbacks or non-react contexts
export const theme: Theme = {
  isDark: false,
  colors: lightColors,
  emotions,
  geometry,
};

export function useTheme(): Theme {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return {
    isDark,
    colors: isDark ? darkColors : lightColors,
    emotions,
    geometry,
  };
}

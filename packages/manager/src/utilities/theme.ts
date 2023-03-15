import { Theme } from '@mui/material/styles';
import { ThemeName } from 'src/themeFactory';
import { dark, light } from 'src/themes';

export type ThemeChoice = 'light' | 'dark' | 'system';

export const themes: Record<ThemeName, Theme> = { light, dark };

/**
 * If you need to toggle Cloud Manager's theme, use this function
 * to get the "next" theme.
 */
export const getNextThemeValue = (currentTheme: string | undefined) => {
  const isSystemInDarkMode =
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (currentTheme === 'system') {
    return isSystemInDarkMode ? 'light' : 'dark';
  }
  return currentTheme === 'dark' ? 'light' : 'dark';
};

/**
 * Use this to validate if a value in a user's preferences is a valid value
 */
export const isValidTheme = (value: unknown): boolean => {
  return typeof value === 'string' && themes[value] !== undefined;
};

/**
 * Given a user's preference (light | dark | system), get the name of the actual
 * theme we should use
 */
export const getThemeFromPreferenceValue = (
  value: unknown,
  isSystemInDarkMode: boolean
): ThemeName => {
  const systemTheme = isSystemInDarkMode ? 'dark' : 'light';
  if (value === 'system') {
    return systemTheme;
  }
  if (isValidTheme(value)) {
    return value as ThemeName;
  }
  return systemTheme;
};

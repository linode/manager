import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import { dark, light } from 'src/foundations/themes';

import type { ThemeName } from 'src/foundations/themes';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { usePreferences } from 'src/queries/preferences';

export type ThemeChoice = 'dark' | 'light' | 'system';

export const themes: Record<ThemeName, Theme> = { dark, light };

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

export const useColorMode = () => {
  // Make sure we are authenticated before we fetch preferences.
  const isAuthenticated = !!useAuthentication().token;
  const { data: preferences } = usePreferences(isAuthenticated);
  const isSystemInDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const colorMode = getThemeFromPreferenceValue(
    preferences?.theme,
    isSystemInDarkMode
  );

  return { colorMode };
};

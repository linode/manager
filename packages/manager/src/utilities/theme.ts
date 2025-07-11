import { usePreferences } from '@linode/queries';
import { dark, light } from '@linode/ui';
import useMediaQuery from '@mui/material/useMediaQuery';

import type { ThemeName } from '@linode/ui';
import type { Theme } from '@mui/material/styles';

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
  return typeof value === 'string' && value in themes;
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
  const { data: themePreference } = usePreferences(
    (preferences) => preferences?.theme,
    // Disable this query so that it only reads from the React Query cache.
    // We don't want it to fetch because this hook us mounted before the user is
    // authenticated, which would result in a 401.
    false
  );

  const isSystemInDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const colorMode = getThemeFromPreferenceValue(
    themePreference,
    isSystemInDarkMode
  );

  return { colorMode };
};

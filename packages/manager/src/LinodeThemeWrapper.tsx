import { StyledEngineProvider } from '@mui/material/styles';
import { Theme, ThemeProvider } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import HLJSDarkTheme from 'highlight.js/styles/a11y-dark.css?raw';
import HLJSLightTheme from 'highlight.js/styles/a11y-light.css?raw';
import * as React from 'react';

import { ThemeName } from './foundations/themes';
import { useAuthentication } from './hooks/useAuthentication';
import { usePreferences } from './queries/preferences';
import { getThemeFromPreferenceValue, themes } from './utilities/theme';

declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

interface Props {
  children: React.ReactNode;
  /** Allows theme to be overwritten. Used for Storybook theme switching */
  theme?: ThemeName;
}

export const LinodeThemeWrapper = ({ children, theme }: Props) => {
  // fallback to default when rendering themed components pre-authentication
  const isAuthenticated = !!useAuthentication().token;
  const { data: preferences } = usePreferences(isAuthenticated);
  const isSystemInDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const selectedTheme =
    theme ??
    getThemeFromPreferenceValue(preferences?.theme, isSystemInDarkMode);

  /**
   * This function exists because we use Hightlight.js and it does not have a built-in
   * way to programaticly change the theme.
   *
   * We must manually switch our Highlight.js theme's CSS when our theme is changed.
   */
  const handleHLJSChange = async (theme: ThemeName) => {
    const THEME_STYLE_ID = 'hljs-theme';
    const existingStyleTag = document.getElementById(THEME_STYLE_ID);

    if (existingStyleTag) {
      // If the style tag already exists in the <head>, just update the css content.
      existingStyleTag.innerHTML =
        theme === 'light' ? HLJSLightTheme : HLJSDarkTheme;
    } else {
      // The page has been loaded and we need to manually append our Hightlight.js
      // css so we can easily change it later on.
      const styleTag = document.createElement('style');
      styleTag.id = THEME_STYLE_ID;
      styleTag.innerHTML = theme === 'light' ? HLJSLightTheme : HLJSDarkTheme;
      document.head.appendChild(styleTag);
    }
  };

  React.useEffect(() => {
    handleHLJSChange(selectedTheme);
  }, [selectedTheme]);

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={themes[selectedTheme]}>{children}</ThemeProvider>
    </StyledEngineProvider>
  );
};

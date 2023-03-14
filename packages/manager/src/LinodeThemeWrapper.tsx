import { StyledEngineProvider } from '@mui/material/styles';
import * as React from 'react';
import { ThemeProvider, Theme } from '@mui/material/styles';
import { dark, light } from 'src/themes';
import { isProductionBuild } from './constants';
import { useAuthentication } from './hooks/useAuthentication';
import { usePreferences } from './queries/preferences';

declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

export type ThemeChoice = 'light' | 'dark';

const themes: Record<ThemeChoice, Theme> = { light, dark };

const setActiveHighlightTheme = (value: ThemeChoice) => {
  /**
   * Disable the inactive highlight.js theme when we toggle
   * the app theme. This looks horrible but it is the recommended approach:
   * https://github.com/highlightjs/highlight.js/blob/master/demo/demo.js
   */

  // Get all the <style>...</style> tags currently rendered.
  // We do this because Webpack writes our CSS into these html tags.
  const links = document.querySelectorAll('style');

  links.forEach((thisLink: any) => {
    // Get the inner content of style tag as a text string
    const content: string = thisLink?.textContent ?? '';

    const isHighlightJS = content.match('.hljs');

    const darkColor = isProductionBuild
      ? 'background:#2b2b2b;'
      : 'background: #2b2b2b;';

    const lightColor = isProductionBuild
      ? 'background:#fefefe;'
      : 'background: #fefefe;';

    // If the CSS string contains .hljs and background: #2b2b2b; we can safely assume
    // we are currently using a11y-dark.css
    if (isHighlightJS && content.match(darkColor)) {
      // If we are in dark mode, disable the dark mode css if the new theme is light
      thisLink.disabled = value === 'light';
    }

    // If the CSS string contains .hljs and background: #fefefe; we can safely assume
    // we are currently using a11y-light.css
    if (isHighlightJS && content.match(lightColor)) {
      // If we are in light mode, disable the light mode css if the new theme is dark
      thisLink.disabled = value === 'dark';
    }
  });
};

const isThemeChoice = (value: unknown): value is ThemeChoice => {
  return typeof value === 'string' && themes[value] !== undefined;
};

interface Props {
  children: React.ReactNode;
  theme?: 'light' | 'dark';
}

const LinodeThemeWrapper = ({ children, theme }: Props) => {
  // fallback to default when rendering themed components pre-authentication
  const isAuthenticated = !!useAuthentication().token;
  const { data: preferences } = usePreferences(isAuthenticated);

  const themePreference = theme ?? preferences?.theme;

  const themeChoice: ThemeChoice = isThemeChoice(themePreference)
    ? themePreference
    : 'light';

  React.useEffect(() => {
    toggleTheme(themeChoice);
  }, [themeChoice]);

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={themes[themeChoice]}>{children}</ThemeProvider>
    </StyledEngineProvider>
  );
};

const toggleTheme = (value: ThemeChoice) => {
  setTimeout(() => {
    document.body.classList.remove('no-transition');
  }, 500);
  setActiveHighlightTheme(value);
};

export default LinodeThemeWrapper;

import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import * as React from 'react';

import { themes, useColorMode } from './utilities/theme';

import type { ThemeName } from '@linode/ui';

interface Props {
  children: React.ReactNode;
  /** Allows theme to be overwritten. Used for Storybook theme switching */
  theme?: ThemeName;
}

export const LinodeThemeWrapper = (props: Props) => {
  const { children, theme: themeOverride } = props;
  const { colorMode } = useColorMode();

  const activeTheme = themeOverride ?? colorMode;

  // Set custom data attribute on document body for third-party tools (like Pendo) to detect theme
  // Pendo can use this as a selector: body[data-theme="dark"] or body[data-theme="light"]
  React.useEffect(() => {
    document.body.setAttribute('data-theme', activeTheme);
    return () => {
      document.body.removeAttribute('data-theme');
    };
  }, [activeTheme]);

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={themes[activeTheme]}>{children}</ThemeProvider>
    </StyledEngineProvider>
  );
};

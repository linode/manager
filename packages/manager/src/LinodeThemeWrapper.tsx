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
  const currentTheme = themeOverride ?? colorMode;

  // Expose theme to DOM for Pendo guide styling
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={themes[currentTheme]}>{children}</ThemeProvider>
    </StyledEngineProvider>
  );
};

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

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={themes[themeOverride ?? colorMode]}>
        {children}
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

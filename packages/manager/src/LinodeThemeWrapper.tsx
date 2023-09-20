import { Theme, ThemeProvider } from '@mui/material/styles';
import { StyledEngineProvider } from '@mui/material/styles';
import * as React from 'react';

import { ThemeName } from './foundations/themes';
import { themes, useColorMode } from './utilities/theme';

declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

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

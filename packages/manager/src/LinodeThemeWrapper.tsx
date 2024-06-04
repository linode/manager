import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import * as React from 'react';

import { dark, darkTokens, light, lightTokens } from 'src/foundations/themes';

import { ThemeName } from './foundations/themes';
import { useFlags } from './hooks/useFlags';
import { themes, useColorMode } from './utilities/theme';

interface Props {
  children: React.ReactNode;
  /** Allows theme to be overwritten. Used for Storybook theme switching */
  theme?: ThemeName;
}

export const LinodeThemeWrapper = (props: Props) => {
  const { children, theme: themeOverride } = props;
  const flags = useFlags();
  const { colorMode } = useColorMode();

  // TODO: This entire if/else block should be removed once design tokens become permanent.
  if (flags.designTokens?.enabled) {
    themes.dark = darkTokens;
    themes.light = lightTokens;
  } else {
    themes.dark = dark;
    themes.light = light;
  }

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={themes[themeOverride ?? colorMode]}>
        {children}
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

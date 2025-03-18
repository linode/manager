import {
  Alias,
  Color,
  Component,
  Font,
  Spacing,
} from '@linode/design-language-system';
import { createTheme } from '@mui/material';

// This is a hack to create breakpoints outside of the theme itself.
// This will likely have to change at some point 😖
export const breakpoints = createTheme({
  breakpoints: {
    values: {
      lg: 1280,
      md: 960,
      sm: 600,
      xl: 1920,
      xs: 0,
    },
  },
  name: 'light',
  tokens: {
    alias: Alias,
    color: Color,
    component: Component,
    font: Font,
    spacing: Spacing,
  },
}).breakpoints;

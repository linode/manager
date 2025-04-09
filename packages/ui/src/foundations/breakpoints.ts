import { Chart, Search } from '@linode/design-language-system';
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
  tokens: { chart: Chart, search: Search },
}).breakpoints;

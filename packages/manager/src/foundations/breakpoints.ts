import { Chart } from '@linode/design-language-system';
import { createTheme } from '@mui/material';

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
  charts: Chart,
  name: 'light',
}).breakpoints;

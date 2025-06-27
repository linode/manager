import { unstable_createBreakpoints } from '@mui/material';

export const breakpoints = unstable_createBreakpoints({
  values: {
    lg: 1280,
    md: 960,
    sm: 600,
    xl: 1920,
    xs: 0,

    // Custom breakpoints for Details Layout
    dl_tablet950: 950,     
    dl_desktop1030: 1030,  
    dl_desktop1214: 1214,    
  },
});

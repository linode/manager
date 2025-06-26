import { unstable_createBreakpoints } from '@mui/material';

export const breakpoints = unstable_createBreakpoints({
  values: {
    lg: 1280,
    md: 960,
    sm: 600,
    xl: 1920,
    xs: 0,

    // Custom prefixed breakpoints for Details Layout
    dl_mobile: 0,             // 0-599px
    dl_tabletSmall: 600,      // 600-949px
    dl_tabletLarge: 950,      // 950-959px
    dl_desktopBase: 960,      // Minimum desktop threshold
    dl_collapsedSmall: 960,   // 960-1029px (collapsed menu)
    dl_collapsedLarge: 1030,  // 1030+ (collapsed menu) 
    dl_fullSmall: 960,        // 960-1213px (full menu)
    dl_fullLarge: 1214,       // 1214+ (full menu)
  },
});

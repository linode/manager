import { useMediaQuery } from "@mui/material";
import { useTheme } from '@mui/material/styles';
import { usePreferences } from '../../../../queries';

declare module '@mui/material/styles' {
  interface BreakpointOverrides {
    dl_tablet950: true;
    dl_desktop1030: true;
    dl_desktop1214: true;
    xs: true;
    sm: true;
    md: true;
    lg: true;
    xl: true;
  }
}

export const useDetailsLayoutBreakpoints = () => {
  const theme = useTheme();

  const { data: isDesktopSidebarOpenPreference } = usePreferences(
    (preferences) => preferences?.desktop_sidebar_open
  );
  const menuIsCollapsed = isDesktopSidebarOpenPreference ?? false;

  const isMobile = useMediaQuery(theme.breakpoints.between('xs', 'sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  return {
    isMobile,
    isTablet,
    isDesktop,
    menuIsCollapsed,
  };
};

export default useDetailsLayoutBreakpoints;
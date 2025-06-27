import { useMediaQuery } from "@mui/material";
import { useTheme } from '@mui/material/styles';
import { useEffect, useState, useRef } from 'react';
import {
  usePreferences,
} from '../../../../queries';

declare module '@mui/material/styles' {
  interface BreakpointOverrides {
    dl_mobile: true;
    dl_tabletSmall: true;
    dl_tabletLarge: true;
    dl_desktopBase: true;
    dl_collapsedSmall: true;
    dl_collapsedLarge: true;
    dl_fullSmall: true;
    dl_fullLarge: true;
    xs: true;
    sm: true;
    md: true;
    lg: true;
    xl: true;
  }
}

export type LayoutState = 
  | 'mobile'
  | 'tabletSmall'
  | 'tabletLarge'
  | 'collapsedSmall'
  | 'collapsedLarge'
  | 'fullSmall'
  | 'fullLarge';

export const useDetailsLayoutBreakpoints = () => {
  const theme = useTheme();

  const { data: isDesktopSidebarOpenPreference } = usePreferences(
    (preferences) => preferences?.desktop_sidebar_open
  );
  const menuIsCollapsed = isDesktopSidebarOpenPreference ?? false;

  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 0
  );
  const prevStateRef = useRef<LayoutState | null>(null);
  const prevMenuStateRef = useRef<boolean | null>(null); // ✅ track previous menu state

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      setWindowWidth(window.innerWidth);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, []);

  const isMobile = useMediaQuery(theme.breakpoints.between('dl_mobile', 'sm')); // 0-599
  const isTabletSmall = useMediaQuery(theme.breakpoints.between('dl_tabletSmall', 'dl_tabletLarge')); // 600-949
  const isTabletLarge = useMediaQuery(theme.breakpoints.between('dl_tabletLarge', 'dl_desktopBase')); // 950-959
  const isTablet = useMediaQuery(theme.breakpoints.between('dl_tabletSmall', 'dl_desktopBase')); // 600-959

  // Collapsed menu states
  const isCollapsedSmall = useMediaQuery(
    theme.breakpoints.between('dl_collapsedSmall', 'dl_collapsedLarge')
  ); // 960-1029
  const isCollapsedLarge = useMediaQuery(
    theme.breakpoints.up('dl_collapsedLarge')
  ); // 1030+

  // Full menu states
  const isFullSmall = useMediaQuery(
    theme.breakpoints.between('dl_fullSmall', 'dl_fullLarge')
  ); // 960-1213
  const isFullLarge = useMediaQuery(
    theme.breakpoints.up('dl_fullLarge')
  ); // 1214+

  // Desktop (either menu state)
  const isDesktop = useMediaQuery(theme.breakpoints.up('dl_desktopBase')); // 960+

  const getLayoutState = (): LayoutState => {
    if (isMobile) return 'mobile';
    if (isTabletSmall) return 'tabletSmall';
    if (isTabletLarge) return 'tabletLarge';

    if (menuIsCollapsed) {
      if (isCollapsedSmall) return 'collapsedSmall';
      return 'collapsedLarge';
    } else {
      if (isFullSmall) return 'fullSmall';
      return 'fullLarge';
    }
  };

  const currentState = getLayoutState();

  useEffect(() => {
    const prevState = prevStateRef.current;

    if (prevState !== currentState) {
      let breakpointRange = '';
      switch (currentState) {
        case 'mobile':
          breakpointRange = '0-599px';
          break;
        case 'tabletSmall':
          breakpointRange = '600-949px';
          break;
        case 'tabletLarge':
          breakpointRange = '950-959px';
          break;
        case 'collapsedSmall':
          breakpointRange = '960-1029px (collapsed menu)';
          break;
        case 'collapsedLarge':
          breakpointRange = '1030px+ (collapsed menu)';
          break;
        case 'fullSmall':
          breakpointRange = '960-1213px (full menu)';
          break;
        case 'fullLarge':
          breakpointRange = '1214px+ (full menu)';
          break;
      }

      console.log(
        `%c BreakpointChange: ${prevState || 'initial'} → ${currentState} %c Width: ${windowWidth}px | Range: ${breakpointRange}`,
        'background: #2196F3; color: white; padding: 2px 6px; border-radius: 2px; font-weight: bold;',
        'background: #333; color: white; padding: 2px 6px; border-radius: 2px;'
      );

      prevStateRef.current = currentState;
    }
  }, [currentState, windowWidth]);

  useEffect(() => {
    const prev = prevMenuStateRef.current;

    if (prev !== null && prev !== menuIsCollapsed) {
      console.log(
        `%c Menu Toggled: ${prev ? 'Collapsed' : 'Expanded'} → ${menuIsCollapsed ? 'Collapsed' : 'Expanded'}`,
        'background: #9C27B0; color: white; padding: 2px 6px; border-radius: 2px; font-weight: bold;'
      );
    }

    prevMenuStateRef.current = menuIsCollapsed;
  }, [menuIsCollapsed]);

  return {
    isMobile,
    isTabletSmall,
    isTabletLarge,
    isTablet,
    isDesktop,
    isCollapsedSmall,
    isCollapsedLarge,
    isFullSmall,
    isFullLarge,
    getLayoutState,
    currentBreakpoint: currentState,
    windowWidth,
  };
};

export default useDetailsLayoutBreakpoints;

import { useMediaQuery } from "@mui/material";
import { useTheme } from '@mui/material/styles';
import { useEffect, useState, useRef } from 'react';
import {
  usePreferences,
} from '../../../../queries';

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

export type LayoutState = 
  | 'mobile'
  | 'tabletSmall'
  | 'tabletLarge'
  | 'desktopNavClosedSmall'
  | 'desktopNavClosedLarge'
  | 'desktopNavOpenedSmall'
  | 'desktopNavOpenedLarge';

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
  const prevMenuStateRef = useRef<boolean | null>(null);

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

  // Mobile: 0-599px (xs to sm)
  const isMobile = useMediaQuery(theme.breakpoints.between('xs', 'sm'));
  
  // Tablet Small: 600-949px (sm to dl_tablet950)
  const isTabletSmall = useMediaQuery(theme.breakpoints.between('sm', 'dl_tablet950'));
  
  // Tablet Large: 950-959px (dl_tablet950 to md)
  const isTabletLarge = useMediaQuery(theme.breakpoints.between('dl_tablet950', 'md'));
  
  // Any Tablet: 600-959px (sm to md)
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  // Desktop (either menu state): 960px+ (md and up)
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  // Desktop with Nav Closed
  // Small: 960-1029px (md to dl_desktop1030)
  const isDesktopNavClosedSmall = useMediaQuery(
    theme.breakpoints.between('md', 'dl_desktop1030')
  );
  
  // Large: 1030px+ (dl_desktop1030 and up)
  const isDesktopNavClosedLarge = useMediaQuery(
    theme.breakpoints.up('dl_desktop1030')
  );

  // Desktop with Nav Opened
  // Small: 960-1213px (md to dl_desktop1214)
  const isDesktopNavOpenedSmall = useMediaQuery(
    theme.breakpoints.between('md', 'dl_desktop1214')
  );
  
  // Large: 1214px+ (dl_desktop1214 and up)
  const isDesktopNavOpenedLarge = useMediaQuery(
    theme.breakpoints.up('dl_desktop1214')
  );

  const getLayoutState = (): LayoutState => {
    if (isMobile) return 'mobile';
    if (isTabletSmall) return 'tabletSmall';
    if (isTabletLarge) return 'tabletLarge';

    if (menuIsCollapsed) {
      if (isDesktopNavClosedSmall) return 'desktopNavClosedSmall';
      return 'desktopNavClosedLarge';
    } else {
      if (isDesktopNavOpenedSmall) return 'desktopNavOpenedSmall';
      return 'desktopNavOpenedLarge';
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
        case 'desktopNavClosedSmall':
          breakpointRange = '960-1029px (collapsed menu)';
          break;
        case 'desktopNavClosedLarge':
          breakpointRange = '1030px+ (collapsed menu)';
          break;
        case 'desktopNavOpenedSmall':
          breakpointRange = '960-1213px (full menu)';
          break;
        case 'desktopNavOpenedLarge':
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
    isDesktopNavClosedSmall,
    isDesktopNavClosedLarge,
    isDesktopNavOpenedSmall,
    isDesktopNavOpenedLarge,
    getLayoutState,
    currentBreakpoint: currentState,
    windowWidth,
    menuIsCollapsed, 
  };
};

export default useDetailsLayoutBreakpoints;
import * as React from 'react';

/**
 * Pixel widths — must stay aligned with `@linode/ui` `foundations/breakpoints`.
 * TODO: import from @akamai/compute-ui when available.
 */
export const THEME_BREAKPOINT_PX = {
  xs: 0,
  sm: 600,
  md: 960,
  lg: 1280,
  xl: 1920,
} as const;

export type ThemeBreakpoint = keyof typeof THEME_BREAKPOINT_PX;

export type BreakpointDirection = 'down' | 'up';

const getMediaQuery = (
  direction: BreakpointDirection,
  breakpoint: ThemeBreakpoint
): string => {
  const px = THEME_BREAKPOINT_PX[breakpoint];

  if (direction === 'up') {
    return `(min-width: ${px}px)`;
  }

  // "down" = strictly below this breakpoint’s min width (same idea as MUI `breakpoints.down`)
  if (px <= 0) {
    return '(max-width: -1px)';
  }

  return `(max-width: ${px - 1}px)`;
};

/**
 * Subscribes to a single viewport query derived from breakpoint widths.
 * Re-renders when the query’s `matches` value changes.
 */
export const useBreakpoint = (
  direction: BreakpointDirection,
  breakpoint: ThemeBreakpoint
): boolean => {
  const query = getMediaQuery(direction, breakpoint);

  return React.useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === 'undefined') {
        return () => {};
      }

      const mq = window.matchMedia(query);
      const handler = () => {
        onStoreChange();
      };
      mq.addEventListener('change', handler);

      return () => mq.removeEventListener('change', handler);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
};

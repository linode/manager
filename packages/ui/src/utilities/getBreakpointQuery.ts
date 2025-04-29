import type { Theme } from '@mui/material';

type Breakpoint = keyof Theme['breakpoints']['values'];

/**
 * Get the breakpoint query for a given breakpoint and direction.
 *
 * @param theme - The theme object.
 * @param breakpoint - The breakpoint to get the query for.
 * @param direction - The direction to get the query for.
 *
 * @returns {string} The breakpoint query.
 */
export const getBreakpointQuery = (
  theme: Theme,
  breakpoint: Breakpoint,
  direction: 'down' | 'up',
): string => {
  const breakpoints = theme.breakpoints.values;

  if (direction === 'up') {
    return `@media (min-width:${breakpoints[breakpoint]}px)`;
  }

  return `@media (max-width:${breakpoints[breakpoint] - 0.05}px)`;
};

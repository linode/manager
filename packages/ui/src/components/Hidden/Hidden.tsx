import { useMediaQuery, useTheme } from '@mui/material';
import * as React from 'react';

type Breakpoint = 'lg' | 'md' | 'sm' | 'xl' | 'xs';

export interface HiddenProps {
  children?: React.ReactNode;
  lgDown?: boolean;
  lgUp?: boolean;
  mdDown?: boolean;
  mdUp?: boolean;
  only?: Breakpoint | Breakpoint[];
  smDown?: boolean;
  smUp?: boolean;
  xlDown?: boolean;
  xlUp?: boolean;
  xsDown?: boolean;
  xsUp?: boolean;
}

const breakpointOrder: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl'];

// Returns true if screen width is the same or greater than the given breakpoint.
const isWidthUp = (
  breakpoint: Breakpoint,
  width: Breakpoint,
  inclusive = true,
) => {
  if (inclusive) {
    return (
      breakpointOrder.indexOf(breakpoint) <= breakpointOrder.indexOf(width)
    );
  }
  return breakpointOrder.indexOf(breakpoint) < breakpointOrder.indexOf(width);
};

// Returns true if screen width is less than the given breakpoint.
const isWidthDown = (
  breakpoint: Breakpoint,
  width: Breakpoint,
  inclusive = false,
) => {
  if (inclusive) {
    return (
      breakpointOrder.indexOf(width) <= breakpointOrder.indexOf(breakpoint)
    );
  }
  return breakpointOrder.indexOf(width) < breakpointOrder.indexOf(breakpoint);
};

const useCurrentWidth = (): Breakpoint => {
  const theme = useTheme();
  const matchesSm = useMediaQuery(theme.breakpoints.up('sm'));
  const matchesMd = useMediaQuery(theme.breakpoints.up('md'));
  const matchesLg = useMediaQuery(theme.breakpoints.up('lg'));
  const matchesXl = useMediaQuery(theme.breakpoints.up('xl'));

  if (matchesXl) return 'xl';
  if (matchesLg) return 'lg';
  if (matchesMd) return 'md';
  if (matchesSm) return 'sm';
  return 'xs';
};

export const Hidden: React.FC<HiddenProps> = (props) => {
  const { children, only, ...rest } = props;
  const width = useCurrentWidth();

  let visible = true;

  // `only` check is faster to get out sooner if used.
  if (only) {
    if (Array.isArray(only)) {
      for (let i = 0; i < only.length; i += 1) {
        const breakpoint = only[i];
        if (width === breakpoint) {
          visible = false;
          break;
        }
      }
    } else if (only && width === only) {
      visible = false;
    }
  }

  // Allow `only` to be combined with other props. If already hidden, no need to check others.
  if (visible) {
    for (let i = 0; i < breakpointOrder.length; i += 1) {
      const breakpoint = breakpointOrder[i];
      const breakpointUp = rest[`${breakpoint}Up` as keyof HiddenProps];
      const breakpointDown = rest[`${breakpoint}Down` as keyof HiddenProps];
      if (
        (breakpointUp && isWidthUp(breakpoint, width)) ||
        (breakpointDown && isWidthDown(breakpoint, width))
      ) {
        visible = false;
        break;
      }
    }
  }

  if (!visible) {
    return null;
  }

  return <>{children}</>;
};

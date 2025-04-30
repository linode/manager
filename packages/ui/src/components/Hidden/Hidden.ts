import { useMediaQuery, useTheme } from '@mui/material';
import type * as React from 'react';

import type { breakpoints } from '../../foundations/breakpoints';

type Breakpoint = keyof typeof breakpoints.values;

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

export const breakpointOrder: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl'];

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

type UpDownKeys = `${Breakpoint}Down` | `${Breakpoint}Up`;
type UpDownProps = Pick<HiddenProps, UpDownKeys>;

export const Hidden: React.FC<HiddenProps> = (props) => {
  const width = useCurrentWidth();
  const {
    children,
    only,
    lgDown,
    lgUp,
    mdDown,
    mdUp,
    smDown,
    smUp,
    xlDown,
    xlUp,
    xsDown,
    xsUp,
  } = props;

  const upDownProps: UpDownProps = {
    lgDown,
    lgUp,
    mdDown,
    mdUp,
    smDown,
    smUp,
    xlDown,
    xlUp,
    xsDown,
    xsUp,
  };

  let visible = true;

  if (only) {
    if (Array.isArray(only)) {
      for (const breakpoint of only) {
        if (width === breakpoint) {
          visible = false;
          break;
        }
      }
    } else if (width === only) {
      visible = false;
    }
  }

  if (visible) {
    for (const breakpoint of breakpointOrder) {
      const breakpointUp = upDownProps[`${breakpoint}Up`];
      const breakpointDown = upDownProps[`${breakpoint}Down`];
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

  return children;
};

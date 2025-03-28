import { Theme, useMediaQuery } from '@mui/material';
import * as React from 'react';

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface HiddenProps {
  children?: React.ReactNode; // Make children optional
  lgDown?: boolean;
  lgUp?: boolean;
  mdDown?: boolean;
  mdUp?: boolean;
  smDown?: boolean;
  smUp?: boolean;
  xlDown?: boolean;
  xlUp?: boolean;
  xsDown?: boolean;
  xsUp?: boolean;
}

const getBreakpointQuery = (
  theme: Theme,
  breakpoint: Breakpoint,
  direction: 'up' | 'down'
): string => {
  const breakpoints = theme.breakpoints.values;
  
  if (direction === 'up') {
    return `@media (min-width:${breakpoints[breakpoint]}px)`;
  }
  return `@media (max-width:${breakpoints[breakpoint] - 0.05}px)`;
};

export const Hidden = React.forwardRef<HTMLDivElement, HiddenProps>(
  (props, ref) => {
    const {
      children,
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
      ...other
    } = props;

    // **
    // Media query conditions
    // **

    // UP
    const matchesXlUp = useMediaQuery((theme: Theme) => 
      getBreakpointQuery(theme, 'xl', 'up')
    );
    const matchesLgUp = useMediaQuery((theme: Theme) => 
      getBreakpointQuery(theme, 'lg', 'up')
    );
    const matchesMdUp = useMediaQuery((theme: Theme) => 
      getBreakpointQuery(theme, 'md', 'up')
    );
    const matchesSmUp = useMediaQuery((theme: Theme) => 
      getBreakpointQuery(theme, 'sm', 'up')
    );
    const matchesXsUp = useMediaQuery((theme: Theme) => 
      getBreakpointQuery(theme, 'xs', 'up')
    );

    // DOWN
    const matchesXlDown = useMediaQuery((theme: Theme) => 
      getBreakpointQuery(theme, 'xl', 'down')
    );
    const matchesLgDown = useMediaQuery((theme: Theme) => 
      getBreakpointQuery(theme, 'lg', 'down')
    );
    const matchesMdDown = useMediaQuery((theme: Theme) => 
      getBreakpointQuery(theme, 'md', 'down')
    );
    const matchesSmDown = useMediaQuery((theme: Theme) => 
      getBreakpointQuery(theme, 'sm', 'down')
    );
    const matchesXsDown = useMediaQuery((theme: Theme) => 
      getBreakpointQuery(theme, 'xs', 'down')
    );

    const shouldHide =
      (xlUp && matchesXlUp) ||
      (lgUp && matchesLgUp) ||
      (mdUp && matchesMdUp) ||
      (smUp && matchesSmUp) ||
      (xlDown && matchesXlDown) ||
      (lgDown && matchesLgDown) ||
      (mdDown && matchesMdDown) ||
      (smDown && matchesSmDown) ||
      (xsDown && matchesXsDown) ||
      (xsUp && matchesXsUp);

    // If used as a configuration object (no children), return the shouldHide value
    if (!children) {
      return shouldHide;
    }

    // If used as a wrapper component and should hide, return null
    if (shouldHide) {
      return null;
    }

    // Otherwise render
    return (
      <div ref={ref} {...other}>
        {children}
      </div>
    );
  }
) as React.ForwardRefExoticComponent<HiddenProps> & {
  (props: HiddenProps): boolean;
};

Hidden.displayName = 'Hidden';
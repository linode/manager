import { useMediaQuery } from '@mui/material';
import * as React from 'react';

import { getBreakpointQuery } from '../../utilities/getBreakpointQuery';

import type { Theme } from '@mui/material';

export interface HiddenProps {
  children?: React.ReactNode;
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

/**
 * This component is a replacement for the `@mui/material`'s `Hidden` component, which is deprecated.
 * It is used to conditionally render a component based on the viewport.
 */
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

    const matchesXlUp = useMediaQuery((theme: Theme) =>
      getBreakpointQuery(theme, 'xl', 'up'),
    );
    const matchesLgUp = useMediaQuery((theme: Theme) =>
      getBreakpointQuery(theme, 'lg', 'up'),
    );
    const matchesMdUp = useMediaQuery((theme: Theme) =>
      getBreakpointQuery(theme, 'md', 'up'),
    );
    const matchesSmUp = useMediaQuery((theme: Theme) =>
      getBreakpointQuery(theme, 'sm', 'up'),
    );
    const matchesXlDown = useMediaQuery((theme: Theme) =>
      getBreakpointQuery(theme, 'xl', 'down'),
    );
    const matchesLgDown = useMediaQuery((theme: Theme) =>
      getBreakpointQuery(theme, 'lg', 'down'),
    );
    const matchesMdDown = useMediaQuery((theme: Theme) =>
      getBreakpointQuery(theme, 'md', 'down'),
    );
    const matchesSmDown = useMediaQuery((theme: Theme) =>
      getBreakpointQuery(theme, 'sm', 'down'),
    );
    const matchesXsDown = useMediaQuery((theme: Theme) =>
      getBreakpointQuery(theme, 'xs', 'down'),
    );
    const matchesXsUp = useMediaQuery((theme: Theme) =>
      getBreakpointQuery(theme, 'xs', 'up'),
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

    if (!children) {
      return shouldHide;
    }

    if (shouldHide) {
      return null;
    }

    return (
      <div ref={ref} {...other}>
        {children}
      </div>
    );
  },
);

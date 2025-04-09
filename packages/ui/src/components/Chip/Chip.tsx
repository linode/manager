import { default as _Chip } from '@mui/material/Chip';
import * as React from 'react';

import type { ChipProps as _ChipProps } from '@mui/material/Chip';

export interface ChipProps extends _ChipProps {
  /**
   * Optional component to render instead of a span.
   */
  component?: React.ElementType;
}

export const Chip = React.forwardRef<HTMLDivElement, ChipProps>(
  (props: ChipProps, ref) => {
    return <_Chip ref={ref} {...props} />;
  },
);

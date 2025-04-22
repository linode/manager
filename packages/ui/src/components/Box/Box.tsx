import { default as _Box } from '@mui/material/Box';
import * as React from 'react';

import type { BoxProps } from '@mui/material/Box';

/**
 * The Box component serves as a wrapper for creating simple layouts or styles.
 * It uses a `<div />` unless unless you change it with the `component` prop
 */
export const Box = React.forwardRef((props: BoxProps, ref) => {
  return <_Box {...props} ref={ref} />;
});

export type { BoxProps };

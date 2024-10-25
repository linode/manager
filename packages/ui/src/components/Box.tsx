import { default as _Box } from '@mui/material/Box';
import React from 'react';

import type { BoxProps } from '@mui/material/Box';

/**
 * The Box component serves as a wrapper for creating simple layouts or styles.
 * It uses a `<div />` unless unless you change it with the `component` prop
 */
export const Box = (props: BoxProps) => {
  return <_Box {...props} />;
};

export type { BoxProps };

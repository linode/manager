import { default as _Box, BoxProps } from '@mui/material/Box';
import React from 'react';

/**
 * The Box component serves as a wrapper for creating simple layouts or styles.
 * It uses a `<div />` unless unless you change it with the `component` prop
 */
export const Box = (props: BoxProps) => {
  return <_Box {...props} />;
};

export type { BoxProps };

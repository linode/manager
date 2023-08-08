import _CircularProgress from '@mui/material/CircularProgress';
import React from 'react';

import type { CircularProgressProps } from '@mui/material/CircularProgress';

/**
 * Not to be confused with `<CircleProgress />`.
 * @todo Consolidate these two components
 */
export const CircularProgress = (props: CircularProgressProps) => {
  return <_CircularProgress {...props} />;
};

export type { CircularProgressProps };

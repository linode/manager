import React from 'react';
import { default as _LinearProgress } from '@mui/material/LinearProgress';
import type { LinearProgressProps as _LinearProgressProps } from '@mui/material/LinearProgress';

export const LinearProgress = (props: _LinearProgressProps) => {
  return <_LinearProgress {...props} data-testid="linear-progress" />;
};

// I'd like to do this but storybook won't generate args for this
// export { LinearProgress } from '@mui/material';
// export type { LinearProgressProps } from '@mui/material/LinearProgress';

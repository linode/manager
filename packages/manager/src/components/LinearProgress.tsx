import React from 'react';
import { default as _LinearProgress } from '@mui/material/LinearProgress';
import type { LinearProgressProps } from '@mui/material/LinearProgress';

const LinearProgress = (props: LinearProgressProps) => {
  return <_LinearProgress {...props} data-testid="linear-progress" />;
};

export { LinearProgress, LinearProgressProps };

import { default as _LinearProgress } from '@mui/material/LinearProgress';
import React from 'react';

import type { LinearProgressProps } from '@mui/material/LinearProgress';

/**
 * Indeterminate indicator that expresses an unspecified amount of wait time. They should be used when progress isn’t detectable, or if it’s not necessary to indicate how long an activity will take.
 */
const LinearProgress = (props: LinearProgressProps) => {
  return <_LinearProgress {...props} data-testid="linear-progress" />;
};

export { LinearProgress, LinearProgressProps };

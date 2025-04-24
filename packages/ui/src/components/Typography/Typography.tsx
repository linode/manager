import { default as _Typography } from '@mui/material/Typography';
import React from 'react';

import type { TypographyProps as _TypographyProps } from '@mui/material/Typography';

export interface TypographyProps extends Omit<_TypographyProps, 'fontFamily'> {
  htmlFor?: string;
}

export const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  (props, ref) => {
    return <_Typography {...props} ref={ref} />;
  }
);

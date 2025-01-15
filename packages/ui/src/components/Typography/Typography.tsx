import { default as _Typography } from '@mui/material/Typography';
import React from 'react';

import type { TypographyProps as _TypographyProps } from '@mui/material/Typography';

export interface TypographyProps extends Omit<_TypographyProps, 'fontFamily'> {
  htmlFor?: string;
}

export const Typography = (props: TypographyProps) => {
  return <_Typography {...props} />;
};

import React from 'react';
import { default as _Typography } from '@mui/material/Typography';
import type { TypographyProps } from '@mui/material/Typography';

export const Typography: typeof _Typography = (props: TypographyProps) => {
  return <_Typography {...props} />;
};

export type { TypographyProps };

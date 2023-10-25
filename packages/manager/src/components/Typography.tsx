import { default as _Typography } from '@mui/material/Typography';
import * as React from 'react';

import type { TypographyProps as _TypographyProps } from '@mui/material/Typography';

export type TypographyProps = Omit<_TypographyProps, 'fontWeight'>;

export const Typography = (props: TypographyProps) => {
  return <_Typography {...props} />;
};

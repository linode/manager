import { default as _Chip } from '@mui/material/Chip';
import { ChipProps as _ChipProps } from '@mui/material/Chip';
import * as React from 'react';

export interface ChipProps extends _ChipProps {
  /**
   * Optional component to render instead of a span.
   */
  component?: React.ElementType;
}

export const Chip = (props: ChipProps) => {
  return <_Chip {...props} />;
};

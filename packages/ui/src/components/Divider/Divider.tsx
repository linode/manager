import _Divider from '@mui/material/Divider';
import { styled } from '@mui/material/styles';
import * as React from 'react';
import type { DividerProps as _DividerProps } from '@mui/material/Divider';
import { omittedProps } from '../../utilities';

export interface DividerProps extends _DividerProps {
  dark?: boolean;
  light?: boolean;
  spacingBottom?: number;
  spacingTop?: number;
}

export const Divider = (props: DividerProps) => {
  return <StyledDivider {...props} />;
};

const StyledDivider = styled(_Divider, {
  label: 'StyledDivider',
  shouldForwardProp: omittedProps([
    'spacingTop',
    'spacingBottom',
    'light',
    'dark',
  ]),
})<DividerProps>(({ ...props }) => ({
  marginBottom: props.spacingBottom,
  marginTop: props.spacingTop,
}));

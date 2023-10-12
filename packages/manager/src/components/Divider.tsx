import _Divider, { DividerProps as _DividerProps } from '@mui/material/Divider';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { omittedProps } from 'src/utilities/omittedProps';

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
  shouldForwardProp: (prop) =>
    omittedProps(['spacingTop', 'spacingBottom', 'light', 'dark'], prop),
})<DividerProps>(({ theme, ...props }) => ({
  borderColor: props.dark
    ? theme.color.border2
    : props.light
    ? theme.name === 'light'
      ? '#e3e5e8'
      : '#2e3238'
    : '',
  marginBottom: props.spacingBottom,
  marginTop: props.spacingTop,
}));

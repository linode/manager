import Divider, { DividerProps as _DividerProps } from '@mui/material/Divider';
import * as React from 'react';
import { styled } from '@mui/material/styles';
import { isPropValid } from 'src/utilities/isPropValid';

export interface DividerProps extends _DividerProps {
  dark?: boolean;
  light?: boolean;
  spacingTop?: number;
  spacingBottom?: number;
}

const _Divider = (props: DividerProps) => {
  return <StyledDivider {...props} />;
};

export default _Divider;

const StyledDivider = styled(Divider, {
  label: 'StyledDivider',
  shouldForwardProp: (prop) =>
    isPropValid(['spacingTop', 'spacingBottom'], prop),
})<DividerProps>(({ theme, ...props }) => ({
  borderColor: props.dark
    ? theme.color.border2
    : props.light
    ? theme.name === 'light'
      ? '#e3e5e8'
      : '#2e3238'
    : '',
  marginTop: props.spacingTop,
  marginBottom: props.spacingBottom,
}));

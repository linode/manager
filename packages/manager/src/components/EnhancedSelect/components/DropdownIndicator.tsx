import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import { styled } from '@mui/material/styles';
import * as React from 'react';
import { IndicatorProps } from 'react-select';

interface Props extends IndicatorProps<any, any> {}

export const DropdownIndicator = (props: Props) => {
  return <StyledKeyboardArrowDown />;
};

const StyledKeyboardArrowDown = styled(KeyboardArrowDown)(() => ({
  color: '#aaa !important',
  width: 28,
  height: 28,
  opacity: 0.5,
  marginTop: 0,
  transition: 'color 225ms ease-in-out',
  marginRight: '4px',
  pointerEvents: 'none',
}));

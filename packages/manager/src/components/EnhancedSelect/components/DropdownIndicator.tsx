import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import { styled } from '@mui/material/styles';
import * as React from 'react';

export const DropdownIndicator = () => {
  return <StyledKeyboardArrowDown />;
};

const StyledKeyboardArrowDown = styled(KeyboardArrowDown)(() => ({
  color: '#aaa !important',
  height: 28,
  marginRight: '4px',
  marginTop: 0,
  opacity: 0.5,
  pointerEvents: 'none',
  transition: 'color 225ms ease-in-out',
  width: 28,
}));

import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import { styled } from '@mui/material/styles';

export const DropdownIndicator = styled(KeyboardArrowDown)(() => ({
  color: '#aaa',
  width: 28,
  height: 28,
  opacity: 0.5,
  marginTop: 0,
  transition: 'color 225ms ease-in-out',
  marginRight: '4px',
  pointerEvents: 'none',
}));

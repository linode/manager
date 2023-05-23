import Button from './Button';
import { styled } from '@mui/material/styles';

export const LinkStyledButton = styled(Button, {
  label: 'LinkStyledButton',
})(({ theme }) => ({
  background: 'none',
  // color: textColors.linkActiveLight,
  color: theme.textColors.linkActiveLight,
  border: 'none',
  font: 'inherit',
  padding: 0,
  cursor: 'pointer',
  minWidth: 0,
  '&:hover': {
    color: theme.palette.primary.main,
    backgroundColor: 'transparent',
    textDecoration: 'underline',
  },
}));

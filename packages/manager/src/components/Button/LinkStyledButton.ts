import Button from './Button';
import { styled } from '@mui/material/styles';

/**
 * A button that looks like a link. Eventually this treatment will go away,
 * but the sake of the MUI migration we need to keep it around for now, and as a styled component in order to get rid of
 * spreading theme.applyLinkStyles.
 *
 * @todo apply this component wherever theme.applyLinkStyles is used. see #6621
 */
export const LinkStyledButton = styled(Button, {
  label: 'LinkStyledButton',
})(({ theme }) => ({
  background: 'none',
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

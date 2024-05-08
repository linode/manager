import { styled } from '@mui/material/styles';

/**
 * A button that looks like a link. Eventually this treatment will go away,
 * but the sake of the MUI migration we need to keep it around for now, and as a styled component in order to get rid of
 * spreading theme.applyLinkStyles.
 *
 * @todo apply this component wherever theme.applyLinkStyles is used. see #6621
 */
export const StyledLinkButton = styled('button', {
  label: 'StyledLinkButton',
})(({ theme }) => ({
  '&:disabled': {
    color: theme.palette.text.disabled,
    cursor: 'not-allowed',
  },
  '&:hover:not(:disabled)': {
    backgroundColor: 'transparent',
    color: theme.palette.primary.main,
    textDecoration: 'underline',
  },
  background: 'none',
  border: 'none',
  color: theme.textColors.linkActiveLight,
  cursor: 'pointer',
  font: 'inherit',
  minWidth: 0,
  padding: 0,
}));

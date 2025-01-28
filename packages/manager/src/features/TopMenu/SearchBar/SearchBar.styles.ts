import { IconButton } from '@linode/ui';
import { styled } from '@mui/material/styles';

export const StyledIconButton = styled(IconButton, {
  label: 'StyledIconButton',
})(({ theme }) => ({
  '& > span': {
    justifyContent: 'flex-end',
  },
  '& svg': {
    height: 24,
    width: 24,
  },
  '&:hover, &:focus': {
    color: theme.tokens.header.Search.Icon.Hover,
  },
  backgroundColor: 'inherit',
  border: 'none',
  color: theme.tokens.header.Search.Icon.Default,
  cursor: 'pointer',
  padding: theme.tokens.spacing[40],
  position: 'relative',
  [theme.breakpoints.up('sm')]: {
    display: 'none',
  },
}));

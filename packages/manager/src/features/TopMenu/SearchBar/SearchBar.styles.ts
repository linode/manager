import { Box, IconButton, Paper } from '@linode/ui';
import { styled } from '@mui/material/styles';

import Search from 'src/assets/icons/search.svg';

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
  padding: theme.spacing(),
  position: 'relative',
  [theme.breakpoints.up('sm')]: {
    display: 'none',
  },
  top: 1,
}));

export const StyledSearchSuggestionContainer = styled(Paper, {
  label: 'StyledSearchSuggestionContainer',
})(({ theme }) => ({
  '& .MuiAutocomplete-listbox': {
    border: 'none',
    padding: 0,
  },
  '& .MuiAutocomplete-noOptions': {
    border: 'none',
  },
  borderBottomLeftRadius: theme.shape.borderRadius,
  borderBottomRightRadius: theme.shape.borderRadius,
  boxShadow: `0 0 8px ${theme.color.boxShadow}`,
  left: -2,
  marginTop: theme.spacing(),
  padding: 0,
  position: 'relative',
  width: '100%',
}));

export const StyledHelpContainer = styled(Box, {
  label: 'StyledHelpContainer',
})(({ theme }) => ({
  alignItems: 'center',
  backgroundColor: theme.color.grey9,
  borderTop: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  fontSize: '0.8rem',
  padding: theme.spacing(2),
}));

export const StyledSearchIcon = styled(Search, {
  label: 'StyledSearchIcon',
})(({ theme }) => ({
  '&&': {
    '&:hover': {
      color: theme.tokens.header.Search.Icon.Hover,
    },

    color: theme.tokens.header.Search.Icon.Default,
  },
}));

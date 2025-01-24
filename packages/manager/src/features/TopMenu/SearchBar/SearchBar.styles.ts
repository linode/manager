import { Box, IconButton, Paper } from '@linode/ui';
import { styled } from '@mui/material/styles';

export const StyledIconButton = styled(IconButton, {
  label: 'StyledIconButton',
})(({ theme }) => ({
  '& > span': {
    justifyContent: 'flex-end',
  },
  '& svg': {
    height: 25,
    width: 25,
  },
  '&:hover, &:focus': {
    color: theme.tokens.color.Neutrals[40],
  },
  backgroundColor: 'inherit',
  border: 'none',
  color: theme.tokens.color.Neutrals[40],
  cursor: 'pointer',
  padding: theme.spacing(),
  position: 'relative',
  [theme.breakpoints.up('md')]: {
    display: 'none',
  },
  top: 1,
}));

export const StyledSearchBarWrapperDiv = styled('div', {
  label: 'StyledSearchBarWrapperDiv',
})(({ theme }) => ({
  '& svg': {
    height: 20,
    width: 20,
  },
  '&.active': {
    ...theme.inputStyles.focused,
    '&:hover': {
      ...theme.inputStyles.focused,
    },
  },
  '&:hover': {
    ...theme.inputStyles.hover,
  },
  ...theme.inputStyles.default,
  alignItems: 'center',
  display: 'flex',
  flex: 1,
  height: 34,
  marginLeft: theme.spacing(1),
  padding: theme.spacing(1),
  position: 'relative', // for search results
  [theme.breakpoints.down('md')]: {
    '&.active': {
      opacity: 1,
      visibility: 'visible',
      zIndex: 3,
    },
    left: 0,
    margin: 0,
    opacity: 0,
    position: 'absolute',
    visibility: 'hidden',
    width: 'calc(100% - 100px)',
    zIndex: -1,
  },
  [theme.breakpoints.down('sm')]: {
    width: '100%',
  },
  transition: theme.transitions.create(['opacity']),
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
  borderRadius: theme.shape.borderRadius,
  boxShadow: `0 0 10px ${theme.color.boxShadow}`,
  marginTop: theme.spacing(2),
  padding: 0,
  width: '100%',
}));

export const StyledHelpContainer = styled(Box, {
  label: 'StyledHelpContainer',
})(({ theme }) => ({
  borderTop: `1px solid ${theme.palette.divider}`,
  fontSize: '0.875rem',
  padding: theme.spacing(2),
  paddingTop: theme.spacing(2),
}));

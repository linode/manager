import { Box, IconButton, Paper } from '@linode/ui';
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
  padding: theme.spacing(),
  position: 'relative',
  [theme.breakpoints.up('sm')]: {
    display: 'none',
  },
  top: 1,
}));

export const StyledSearchBarWrapperDiv = styled('div', {
  label: 'StyledSearchBarWrapperDiv',
})(({ theme }) => ({
  '& .MuiAutocomplete-popper': {
    [theme.breakpoints.up('md')]: {
      left: `-${theme.spacing()} !important`,
    },
    width: '100% !important',
  },
  '& svg': {
    height: 20,
    width: 20,
  },
  alignItems: 'center',
  backgroundColor: theme.tokens.header.Search.Background,
  boxShadow: 'none !important',
  display: 'flex',
  flex: 1,
  height: 34,
  padding: theme.spacing(1),
  position: 'relative',
  [theme.breakpoints.down('sm')]: {
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
    // width: 'calc(100% - 100px)',
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

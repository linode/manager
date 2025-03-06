import { Box, Chip, ListItem } from '@linode/ui';
import { styled } from '@mui/material/styles';

export const StyledAutocompleteContainer = styled(Box, {
  label: 'RegionSelect',
})(({ theme }) => ({
  '& .MuiAutocomplete-groupLabel': {
    color: theme.color.headline,
    font: theme.font.bold,
    fontSize: '1rem',
    lineHeight: 1,
    padding: '16px 4px 8px 10px',
    textTransform: 'initial',
  },
  '& .MuiAutocomplete-listbox': {
    '& li:first-of-type .MuiAutocomplete-groupLabel': {
      marginTop: -8,
    },
  },
  '& .MuiAutocomplete-root .MuiAutocomplete-inputRoot': {
    paddingRight: 8,
  },
  // If the subheader is empty, hide it to avoid empty padded space
  // This can happen for options that do not belong to a region (e.g. "Global")
  '& .MuiListSubheader-root:empty': {
    display: 'none',
  },
  display: 'flex',
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
  },
}));

export const StyledLParentListItem = styled(ListItem, {
  label: 'RegionSelectParentListItem',
})(() => ({
  '&.MuiListItem-root': {
    '&:first-of-type > div': {
      paddingTop: 10,
    },
    display: 'block',
    padding: 0,
  },
}));

export const StyledChip = styled(Chip)(({ theme }) => ({
  '& .MuiChip-deleteIcon': {
    '& svg': {
      borderRadius: '50%',
    },
    padding: 0,
  },
  '& .MuiChip-deleteIcon.MuiSvgIcon-root': {
    '&:hover': {
      backgroundColor: theme.tokens.color.Neutrals.White,
      color: theme.tokens.color.Ultramarine[70],
    },
    backgroundColor: theme.tokens.color.Ultramarine[70],
    color: theme.tokens.color.Neutrals.White,
  },
}));

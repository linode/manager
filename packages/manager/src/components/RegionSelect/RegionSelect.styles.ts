import DoneIcon from '@mui/icons-material/Done';
import { styled } from '@mui/material/styles';

import { Box } from 'src/components/Box';
import { ListItem } from 'src/components/ListItem';

export const StyledAutocompleteContainer = styled(Box, {
  label: 'RegionSelect',
})(({ theme }) => ({
  '& .MuiAutocomplete-groupLabel': {
    color: theme.color.headline,
    fontFamily: theme.font.bold,
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
}));

export const StyledFlagContainer = styled('div', {
  label: 'RegionSelectFlagContainer',
})(({ theme }) => ({
  marginRight: theme.spacing(1),
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

export const StyledListItem = styled(ListItem, {
  label: 'RegionSelectListItem',
})(({ theme }) => ({
  '&.Mui-disabled': {
    cursor: 'not-allowed',
  },
  '&.MuiAutocomplete-option': {
    minHeight: 'auto !important',
    padding: '8px 10px !important',
  },
  '&.MuiListItem-root[aria-disabled="true"]:active': {
    pointerEvents: 'none !important',
  },
}));

export const SelectedIcon = styled(DoneIcon, {
  label: 'RegionSelectSelectedIcon',
  shouldForwardProp: (prop) => prop != 'visible',
})<{ visible: boolean }>(({ visible }) => ({
  height: 17,
  marginLeft: '-2px',
  marginRight: '5px',
  visibility: visible ? 'visible' : 'hidden',
  width: 17,
}));

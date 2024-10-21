import DoneIcon from '@mui/icons-material/Done';
import { styled } from '@mui/material/styles';

import { Box } from 'src/components/Box';
import { Chip } from 'src/components/Chip';
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
  '& .MuiAutocomplete-root .MuiAutocomplete-inputRoot': {
    paddingRight: 8,
  },
  display: 'flex',
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
  },
}));

export const sxDistributedRegionIcon = {
  '& svg': {
    color: 'inherit !important',
    height: 21,
    width: 24,
  },
  '&:hover': {
    color: 'inherit',
  },
  color: 'inherit',
  padding: 0,
};

export const StyledDistributedRegionBox = styled(Box, {
  label: 'StyledDistributedRegionBox',
  shouldForwardProp: (prop) => prop != 'centerChildren',
})<{ centerChildren: boolean }>(({ centerChildren, theme }) => ({
  '& svg': {
    height: 21,
    marginLeft: 8,
    marginRight: 8,
    width: 24,
  },
  alignSelf: centerChildren ? 'center' : 'end',
  color: 'inherit',
  display: 'flex',
  marginTop: centerChildren ? 21 : 0,
  padding: 8,
  [theme.breakpoints.down('md')]: {
    '& svg': {
      marginLeft: 0,
    },
    alignSelf: 'start',
    marginTop: 0,
    paddingLeft: 0,
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

export const StyledListItem = styled(ListItem, {
  label: 'RegionSelectListItem',
})(() => ({
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

export const StyledChip = styled(Chip)(() => ({
  '& .MuiChip-deleteIcon': {
    '& svg': {
      borderRadius: '50%',
    },
    padding: 0,
  },
  '& .MuiChip-deleteIcon.MuiSvgIcon-root': {
    '&:hover': {
      backgroundColor: '#fff',
      color: '#3683dc',
    },
    backgroundColor: '#3683dc',
    color: '#fff',
  },
}));

import { styled } from '@mui/material/styles';

import { IconButton } from 'src/components/IconButton';
import { TableRow } from 'src/components/TableRow';
import { Typography } from 'src/components/Typography';
import { omittedProps } from 'src/utilities/omittedProps';

export const StyledTagHeaderRow = styled(TableRow, {
  label: 'StyledTagHeaderRow',
})(({ theme }) => ({
  '& td': {
    borderBottom: 'none',
    borderTop: 'none',
    // This is maintaining the spacing between groups because of how tables handle margin/padding. Adjust with care!
    padding: `${theme.spacing(1.25)} 0 2px`,
  },
  backgroundColor: 'transparent !important',
  height: 'auto',
}));

export const StyledTagHeader = styled(Typography, {
  label: 'StyledTagHeader',
})(({ theme }) => ({
  marginBottom: 4,
  marginLeft: theme.spacing(),
}));

export const StyledControlHeader = styled('div', {
  label: 'StyledControlHeader',
  shouldForwardProp: omittedProps(['isGroupedByTag']),
})<{ isGroupedByTag: boolean }>(({ isGroupedByTag, theme }) => ({
  alignItems: 'center',
  backgroundColor: theme.bg.tableHeader,
  display: 'flex',
  height: 46,
  justifyContent: 'flex-end',
  marginBottom: isGroupedByTag ? theme.spacing(4) : 0,
}));

export const StyledToggleButton = styled(IconButton, {
  label: 'StyledToggleButton',
  shouldForwardProp: omittedProps(['isActive']),
})<{ isActive: boolean }>(({ isActive, theme }) => ({
  '&.Mui-disabled': {
    display: 'none',
  },
  '&:focus': {
    // Browser default until we get styling direction for focus states
    outline: '1px dotted #999',
  },
  '&:hover': {
    backgroundColor: theme.palette.grey[300],
    color: isActive ? theme.palette.primary.main : theme.palette.grey[600],
  },
  borderRadius: '100%',
  color: isActive ? theme.palette.primary.main : theme.palette.grey[400],
  padding: 10,
}));

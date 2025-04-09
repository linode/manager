import { IconButton, Typography, omittedProps } from '@linode/ui';
import { styled } from '@mui/material/styles';

import { TableRow } from 'src/components/TableRow';

export const StyledTagHeaderRow = styled(TableRow, {
  label: 'StyledTagHeaderRow',
})(({ theme }) => ({
  '& .MuiTableCell-root': {
    borderBottom: 'none',
    borderTop: 'none',
    // This is maintaining the spacing between groups because of how tables handle margin/padding. Adjust with care!
    padding: `${theme.spacing(1.25)} 0 2px`,
  },
  backgroundColor: 'transparent',
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
})(({ theme }) => ({
  alignItems: 'center',
  backgroundColor: theme.tokens.table.HeaderNested.Background,
  display: 'flex',
  height: 42,
  justifyContent: 'flex-end',
  marginBottom: theme.spacing(1.25),
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
    outline: `1px dotted ${theme.tokens.color.Neutrals[50]}`,
  },
  '&:hover': {
    backgroundColor: theme.palette.grey[300],
    color: isActive ? theme.palette.primary.main : theme.palette.grey[600],
  },
  borderRadius: '100%',
  color: isActive ? theme.palette.primary.main : theme.palette.grey[400],
  padding: 10,
}));

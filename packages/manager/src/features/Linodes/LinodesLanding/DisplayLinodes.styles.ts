import Typography from 'src/components/core/Typography';
import { IconButton } from 'src/components/IconButton';
import { styled } from '@mui/material/styles';
import { TableBody } from 'src/components/TableBody';
import { TableRow } from 'src/components/TableRow';

export const StyledTagHeaderRow = styled(TableRow, {
  label: 'StyledTagHeaderRow',
})(({ theme }) => ({
  backgroundColor: 'transparent !important',
  height: 'auto',
  '& td': {
    // This is maintaining the spacing between groups because of how tables handle margin/padding. Adjust with care!
    padding: `${theme.spacing(1.25)} 0 2px`,
    borderBottom: 'none',
    borderTop: 'none',
  },
}));

export const StyledGroupContainer = styled(TableBody, {
  label: 'StyledGroupContainer',
})(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    '& $tagHeaderRow > td': {
      padding: '10px 0 2px',
      borderTop: 'none',
    },
  },
}));

export const StyledTagHeader = styled(Typography, {
  label: 'StyledTagHeader',
})(({ theme }) => ({
  marginBottom: 4,
  marginLeft: theme.spacing(),
}));

export const StyledControlHeader = styled('div', {
  label: 'StyledControlHeader',
})<{ isGroupedByTag: boolean }>(({ theme, isGroupedByTag }) => ({
  height: 46,
  marginBottom: isGroupedByTag ? theme.spacing(4) : 0,
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
  backgroundColor: theme.bg.tableHeader,
}));

export const StyledToggleButton = styled(IconButton, {
  label: 'StyledToggleButton',
})<{ isActive: boolean }>(({ theme, isActive }) => ({
  color: isActive ? theme.palette.primary.main : theme.palette.grey[400],
  padding: 10,
  height: 20,
  '&:focus': {
    // Browser default until we get styling direction for focus states
    outline: '1px dotted #999',
  },
  '&.Mui-disabled': {
    display: 'none',
  },
}));

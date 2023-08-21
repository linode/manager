import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';

import { TableRow } from 'src/components/TableRow';
import { TableSortCell } from 'src/components/TableSortCell';

export const StyledGrid = styled(Grid, {
  label: 'SyledGrid',
})(({ theme }) => ({
  marginBottom: 5,
  [theme.breakpoints.down('md')]: {
    marginRight: theme.spacing(),
  },
}));

export const StyledTableRow = styled(TableRow, {
  label: 'SyledTableRow',
})(({ theme }) => ({
  '& > th': {
    fontFamily: theme.font.bold,
  },
}));

export const StyledTableSortCell = styled(TableSortCell, {
  label: 'SyledTableSortCell',
})(({ theme }) => ({
  ...theme.applyTableHeaderStyles,
  paddingLeft: `62px !important`,
}));

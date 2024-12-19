import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';

import { TableRow } from 'src/components/TableRow';

export const StyledGrid = styled(Grid, {
  label: 'StyledGrid',
})(({ theme }) => ({
  marginBottom: 5,
  [theme.breakpoints.down('md')]: {
    marginRight: theme.spacing(),
  },
}));

export const StyledTableRow = styled(TableRow, {
  label: 'StyledTableRow',
})(({ theme }) => ({
  '& > th': {
    fontFamily: theme.font.bold,
  },
}));

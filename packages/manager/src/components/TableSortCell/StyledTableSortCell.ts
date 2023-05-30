import { styled } from '@mui/material/styles';
import { TableSortCell } from './TableSortCell';

export const StyledTableSortCell = styled(TableSortCell)(({ theme }) => ({
  width: '40%',
  [theme.breakpoints.down('lg')]: {
    width: '25%',
  },
  '&:hover': {
    cursor: 'pointer',
    '& span': {
      color: theme.textColors.linkActiveLight,
    },
  },
}));

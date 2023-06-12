import { styled } from '@mui/material/styles';
import { TableSortCell } from './TableSortCell';

interface Props {
  mobileWidth?: string;
  width?: string;
}

export const StyledTableSortCell = styled(TableSortCell, {
  label: 'StyledTableSortCell',
})<Props>(({ theme, ...props }) => ({
  width: props.width || '40%',
  [theme.breakpoints.down('lg')]: {
    width: props.mobileWidth || '25%',
  },
  '&:hover': {
    cursor: 'pointer',
    '& span': {
      color: theme.textColors.linkActiveLight,
    },
  },
}));

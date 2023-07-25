import { styled } from '@mui/material/styles';

import { TableSortCell } from './TableSortCell';

interface Props {
  mobileWidth?: string;
  width?: string;
}

export const StyledTableSortCell = styled(TableSortCell, {
  label: 'StyledTableSortCell',
})<Props>(({ theme, ...props }) => ({
  '&:hover': {
    '& span': {
      color: theme.textColors.linkActiveLight,
    },
    cursor: 'pointer',
  },
  [theme.breakpoints.down('lg')]: {
    width: props.mobileWidth || '25%',
  },
  width: props.width || '40%',
}));

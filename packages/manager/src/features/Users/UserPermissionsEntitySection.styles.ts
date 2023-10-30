import { styled } from '@mui/material/styles';

import { Table } from 'src/components/Table';

export const StyledGrantsTable = styled(Table, {
  label: 'StyledGrantsTable',
})(({ theme }) => ({
  '& td': {
    [theme.breakpoints.down('sm')]: {
      paddingRight: '0 !important',
    },
    width: '100%',
  },
  '& th': {
    minWidth: 150,
    width: '25%',
  },
}));

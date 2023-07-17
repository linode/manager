import { styled } from '@mui/material/styles';

import { Table } from 'src/components/Table';
import { TableCell } from 'src/components/TableCell';

export const StyledPermsTable = styled(Table, {
  label: 'StyledPermsTable',
})(({ theme }) => ({
  marginBottom: theme.spacing(),
  marginTop: theme.spacing(3),
}));

export const StyledSelectCell = styled(TableCell, {
  label: 'StyledSelectCell',
})(() => ({
  fontFamily: 'LatoWebBold', // we keep this bold at all times
  fontSize: '.9rem',
}));

export const StyledAccessCell = styled(TableCell, {
  label: 'StyledAccessCell',
})(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    width: '100%',
  },
  width: '31%',
}));

export const StyledPermissionsCell = styled(TableCell, {
  label: 'StyledPermissionsCell',
})(({ theme }) => ({
  textAlign: 'center',
  [theme.breakpoints.down('md')]: {
    width: '100%',
  },
  width: '23%',
}));

import { Table } from 'src/components/Table';
import { TableCell } from 'src/components/TableCell';
import { styled } from '@mui/material/styles';

export const StyledPermsTable = styled(Table, {
  label: 'StyledPermsTable',
})(({ theme }) => ({
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(),
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
  width: '31%',
  [theme.breakpoints.down('md')]: {
    width: '100%',
  },
}));

export const StyledPermissionsCell = styled(TableCell, {
  label: 'StyledPermissionsCell',
})(({ theme }) => ({
  width: '23%',
  [theme.breakpoints.down('md')]: {
    width: '100%',
  },
  textAlign: 'center',
}));

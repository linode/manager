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
})(({ theme }) => ({
  borderBottom: `2px solid ${theme.color.grey2}`,
  font: theme.font.bold,
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

export const StyledSelectAllPermissionsCell = styled(StyledPermissionsCell, {
  label: 'StyledSelectAllPermissionsCell',
})(({ theme }) => ({
  borderBottom: `2px solid ${theme.color.grey2}`,
}));

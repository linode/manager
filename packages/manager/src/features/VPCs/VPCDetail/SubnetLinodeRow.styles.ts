import { styled } from '@mui/material/styles';

import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';

export const StyledTableRow = styled(TableRow, {
  label: 'StyledTableRow',
})(({ theme }) => ({
  '&:last-of-type': {
    '& th, td': {
      borderBottom: `1px solid ${theme.borderColors.borderTable}`,
    },
  },
}));

export const StyledTableCell = styled(TableCell, {
  label: 'StyledTableCell',
})(() => ({
  '&:last-of-type': {
    paddingRight: 16,
  },
  border: 'none',
}));

export const StyledTableHeadCell = styled(TableCell, {
  label: 'StyledTableCell',
})(({ theme }) => ({
  '&:first-of-type': {
    paddingLeft: 48,
  },
  borderBottom: `1px solid ${theme.borderColors.borderTable} !important`,
  borderTop: 'none !important',
}));

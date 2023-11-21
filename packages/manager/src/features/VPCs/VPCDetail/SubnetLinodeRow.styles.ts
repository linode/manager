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
})(({ theme }) => ({
  '&:last-of-type': {
    paddingRight: theme.spacing(2),
  },
  border: 'none',
}));

export const StyledActionTableCell = styled(TableCell, {
  label: 'StyledActionTableCell',
})(() => ({
  border: 'none',
  height: 45,
}));

export const StyledTableHeadCell = styled(TableCell, {
  label: 'StyledTableHeadCell',
})(({ theme }) => ({
  '&:first-of-type': {
    paddingLeft: theme.spacing(6),
  },
  borderBottom: `1px solid ${theme.borderColors.borderTable} !important`,
  borderTop: 'none !important',
}));

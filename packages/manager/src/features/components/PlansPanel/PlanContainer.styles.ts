import { omittedProps } from '@linode/ui';
import { styled } from '@mui/material/styles';

import { Table } from 'src/components/Table';
import { TableCell } from 'src/components/TableCell';

import type { TableCellProps } from 'src/components/TableCell';

interface StyledTableCellPropsProps extends TableCellProps {
  isPlanCell?: boolean;
}

export const StyledTable = styled(Table, {
  label: 'StyledTable',
})(({ theme }) => ({
  overflowX: 'hidden',
}));

export const StyledTableCell = styled(TableCell, {
  label: 'StyledTableCell',
  shouldForwardProp: omittedProps(['isPlanCell']),
})<StyledTableCellPropsProps>(({ theme, ...props }) => ({
  ...(props.isPlanCell && { width: '20%' }),
  '&.emptyCell': {
    borderRight: 'none',
  },
  '&.planHeaderCell': {
    ...(props.isPlanCell && { paddingLeft: 4 }),
  },
  '&:last-child': {
    paddingRight: 15,
  },
  '&:not(.emptyCell)': {
    borderLeft: 'none !important',
  },
  borderBottom: `1px solid ${theme.borderColors.borderTable} !important`,
  borderTop: `1px solid ${theme.borderColors.borderTable} !important`,
}));

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
})({
  overflowX: 'hidden',
});

export const StyledTableCell = styled(TableCell, {
  label: 'StyledTableCell',
  shouldForwardProp: omittedProps(['isPlanCell']),
})<StyledTableCellPropsProps>(({ ...props }) => ({
  ...(props.isPlanCell && { width: '30%' }),
}));

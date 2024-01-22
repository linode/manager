import { styled } from '@mui/material/styles';

import { Table } from 'src/components/Table';
import { TableCell, TableCellProps } from 'src/components/TableCell';
import { omittedProps } from 'src/utilities/omittedProps';

type StyledTableCellPropsProps = TableCellProps & {
  isPlanCell?: boolean;
};

export const StyledTable = styled(Table, {
  label: 'StyledTable',
})(({ theme }) => ({
  borderLeft: `1px solid ${theme.borderColors.borderTable}`,
  borderRight: `1px solid ${theme.borderColors.borderTable}`,
  overflowX: 'hidden',
}));

export const StyledTableCell = styled(TableCell, {
  label: 'StyledTableCell',
  shouldForwardProp: omittedProps(['isPlanCell']),
})<StyledTableCellPropsProps>(({ theme, ...props }) => ({
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

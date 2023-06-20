import { styled } from '@mui/material/styles';
import { Table } from 'src/components/Table';
import { isPropValid } from 'src/utilities/isPropValid';
import { TableCell, TableCellProps } from 'src/components/TableCell';

type StyledTableCellPropsProps = TableCellProps & {
  isPlanCell?: boolean;
};
export const StyledTable = styled(Table, { label: 'StyledTable' })(
  ({ theme }) => ({
    borderLeft: `1px solid ${theme.borderColors.borderTable}`,
    borderRight: `1px solid ${theme.borderColors.borderTable}`,
    overflowX: 'hidden',
  })
);

export const StyledTableCell = styled(TableCell, {
  label: 'StyledTableCell',
  shouldForwardProp: (prop) => isPropValid(['isPlanCell'], prop),
})<StyledTableCellPropsProps>(({ theme, ...props }) => ({
  borderTop: `1px solid ${theme.borderColors.borderTable} !important`,
  borderBottom: `1px solid ${theme.borderColors.borderTable} !important`,
  '&.emptyCell': {
    borderRight: 'none',
  },
  '&:not(.emptyCell)': {
    borderLeft: 'none !important',
  },
  '&:last-child': {
    paddingRight: 15,
  },
  '&.planHeaderCell': {
    ...(props.isPlanCell && { paddingLeft: 4 }),
  },
}));

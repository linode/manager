import { styled } from '@mui/material/styles';
import { Table } from 'src/components/Table';
import { TableCell, TableCellProps } from 'src/components/TableCell';
import { isPropValid } from 'src/utilities/isPropValid';

type StyledTableCellPropsProps = TableCellProps & {
  isPlanCell?: boolean;
};
export const StyledTable = styled(Table, {
  label: 'StyledTable',
  shouldForwardProp: (prop) => isPropValid(['isDisabled'], prop),
})<{ isDisabled?: boolean }>(({ theme, isDisabled }) => ({
  borderLeft: `1px solid ${theme.borderColors.borderTable}`,
  borderRight: `1px solid ${theme.borderColors.borderTable}`,
  opacity: isDisabled ? 0.5 : 1,
  cursor: isDisabled ? 'not-allowed' : 'inherit',
  overflowX: 'hidden',
  '& tr ': {
    opacity: isDisabled ? 0.4 : 1,
  },
}));

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

import { useTheme } from '@mui/material/styles';
import { styled } from '@mui/system';
import { Table } from 'src/components/Table';
import { isPropValid } from 'src/utilities/isPropValid';
import { TableCell, TableCellProps } from 'src/components/TableCell';

const StyledTable = styled(Table)(() => {
  const theme = useTheme();
  return {
    borderLeft: `1px solid ${theme.borderColors.borderTable}`,
    borderRight: `1px solid ${theme.borderColors.borderTable}`,
    overflowX: 'hidden',
  };
});

export interface StyledTableCellPropsProps extends TableCellProps {
  isPlanCell?: boolean;
}

const StyledTableCell = styled(TableCell, {
  shouldForwardProp: (prop) => isPropValid(['isPlanCell'], prop),
})<StyledTableCellPropsProps>(({ ...props }) => {
  const theme = useTheme();

  return {
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
  };
});

export { StyledTableCell, StyledTable };

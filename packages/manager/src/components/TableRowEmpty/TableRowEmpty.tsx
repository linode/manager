import { styled } from '@mui/material/styles';
import * as React from 'react';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';

export interface TableRowEmptyProps {
  colSpan: number;
  message?: string | JSX.Element;
}

export const TableRowEmpty = (props: TableRowEmptyProps) => {
  return (
    <TableRow data-testid={'table-row-empty'}>
      <StyledTableCell colSpan={props.colSpan}>
        {props.message || 'No items to display.'}
      </StyledTableCell>
    </TableRow>
  );
};

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  borderColor: theme.borderColors.borderTable,
  textAlign: 'center',
}));

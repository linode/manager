import { styled } from '@mui/material/styles';
import * as React from 'react';

import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';

export interface TableRowEmptyProps {
  /**
   *  The number of columns the empty state should span
   */
  colSpan: number;
  /**
   * The message to display in the empty state
   * @default 'No items to display.'
   */
  message?: JSX.Element | string;
}

/**
 * - Tables that do not yet have any data should be shown full width with the title and column heads.<br> This let’s users know where data will appear when it is available.
 * - An empty table should have language that clearly says why the table has no data and what action to take to populate with data.
 */
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

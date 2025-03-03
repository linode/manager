import * as React from 'react';

import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';

import type { SxProps } from '@mui/material/styles';

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
  /**
   * The style overrides for the TableCell
   */
  sx?: SxProps;
}

/**
 * - Tables that do not yet have any data should be shown full width with the title and column heads.<br> This let’s users know where data will appear when it is available.
 * - An empty table should have language that clearly says why the table has no data and what action to take to populate with data.
 */
export const TableRowEmpty = (props: TableRowEmptyProps) => {
  const { colSpan, message, sx } = props;

  return (
    <TableRow data-testid={'table-row-empty'} hover={false} sx={sx}>
      <TableCell
        sx={{
          height: '40px',
          textAlign: 'center',
        }}
        colSpan={colSpan}
      >
        {message || 'No items to display.'}
      </TableCell>
    </TableRow>
  );
};

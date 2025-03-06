import { ErrorState } from '@linode/ui';
import * as React from 'react';

import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';

export interface TableRowErrorProps {
  /**
   *  The number of columns the empty state should span
   */
  colSpan: number;
  /**
   * The message to display in the empty state
   * @default 'No items to display.'
   */
  message: JSX.Element | string;
}

export const TableRowError = (props: TableRowErrorProps) => {
  return (
    <TableRow data-testid="table-row-error">
      <TableCell colSpan={props.colSpan}>
        <ErrorState compact errorText={props.message} />
      </TableCell>
    </TableRow>
  );
};

import * as React from 'react';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';

export interface TableRowErrorProps {
  colSpan: number;
  message: string | JSX.Element;
}

export const TableRowError = (props: TableRowErrorProps) => {
  return (
    <TableRow data-testid="table-row-error">
      <TableCell colSpan={props.colSpan}>
        <ErrorState errorText={props.message} compact />
      </TableCell>
    </TableRow>
  );
};

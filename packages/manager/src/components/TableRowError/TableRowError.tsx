import * as React from 'react';
import TableCell from 'src/components/core/TableCell';
import TableRow from 'src/components/core/TableRow';
import ErrorState from 'src/components/ErrorState';

export interface Props {
  colSpan: number;
  message: string | JSX.Element;
}

type CombinedProps = Props;

const TableRowError: React.StatelessComponent<CombinedProps> = props => {
  return (
    <TableRow data-testid="table-row-error">
      <TableCell colSpan={props.colSpan}>
        <ErrorState errorText={props.message} compact />
      </TableCell>
    </TableRow>
  );
};

export default TableRowError;

import * as React from 'react';
import ErrorState from 'src/components/ErrorState';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';

export interface Props {
  colSpan: number;
  message: string | JSX.Element;
}

type CombinedProps = Props;

const TableRowError: React.FC<CombinedProps> = (props) => {
  return (
    <TableRow data-testid="table-row-error">
      <TableCell colSpan={props.colSpan}>
        <ErrorState errorText={props.message} compact />
      </TableCell>
    </TableRow>
  );
};

export default TableRowError;

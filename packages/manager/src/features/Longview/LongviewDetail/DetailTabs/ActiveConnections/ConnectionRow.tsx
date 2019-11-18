import * as React from 'react';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import { LongviewPort } from 'src/features/Longview/request.types';

interface Props {
  connection: LongviewPort;
}

export const ConnectionRow: React.FC<Props> = props => {
  const { connection } = props;
  return (
    <TableRow data-testid="longview-connection-row">
      <TableCell parentColumn="Name" data-qa-connection-name>
        {connection.name}
      </TableCell>
      <TableCell parentColumn="User" data-qa-connection-user>
        {connection.user}
      </TableCell>
      <TableCell parentColumn="Count" data-qa-connection-count>
        {connection.count}
      </TableCell>
    </TableRow>
  );
};

export default ConnectionRow;

import * as React from 'react';

import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';

import type { TableRowOwnProps } from '@mui/material';
import type { LongviewPort } from 'src/features/Longview/request.types';

interface Props {
  connection: LongviewPort;
  hover?: TableRowOwnProps['hover'];
}

export const ConnectionRow = (props: Props) => {
  const { connection, hover } = props;

  return (
    <TableRow data-testid="longview-connection-row" hover={hover}>
      <TableCell data-qa-active-connection-name>{connection.name}</TableCell>
      <TableCell data-qa-active-connection-user>{connection.user}</TableCell>
      <TableCell data-qa-active-connection-count>{connection.count}</TableCell>
    </TableRow>
  );
};

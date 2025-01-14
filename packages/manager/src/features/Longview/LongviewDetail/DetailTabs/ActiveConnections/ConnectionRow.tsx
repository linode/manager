import * as React from 'react';

import { MaskableText } from 'src/components/MaskableText/MaskableText';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';

import type { LongviewPort } from 'src/features/Longview/request.types';

interface Props {
  connection: LongviewPort;
}

export const ConnectionRow = (props: Props) => {
  const { connection } = props;

  return (
    <TableRow data-testid="longview-connection-row">
      <TableCell data-qa-active-connection-name parentColumn="Name">
        {connection.name}
      </TableCell>
      <TableCell data-qa-active-connection-user parentColumn="User">
        <MaskableText isToggleable text={connection.user} />
      </TableCell>
      <TableCell data-qa-active-connection-count parentColumn="Count">
        {connection.count}
      </TableCell>
    </TableRow>
  );
};

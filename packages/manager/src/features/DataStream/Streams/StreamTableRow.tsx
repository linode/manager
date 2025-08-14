import { Hidden } from '@linode/ui';
import * as React from 'react';

import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';

import type { Stream, StreamStatus } from '@linode/api-v4';

interface StreamTableRowProps {
  stream: Stream;
}

export const StreamTableRow = React.memo((props: StreamTableRowProps) => {
  const { stream } = props;

  return (
    <TableRow key={stream.id}>
      <TableCell>{stream.label}</TableCell>
      <TableCell statusCell>
        <StatusIcon status={stream.status} />
        {humanizeStreamStatus(stream.status)}
      </TableCell>
      <TableCell>{stream.id}</TableCell>
      <TableCell>{stream.destinations[0].label}</TableCell>
      <Hidden smDown>
        <TableCell>
          <DateTimeDisplay value={stream.created} />
        </TableCell>
      </Hidden>
    </TableRow>
  );
});

const humanizeStreamStatus = (status: StreamStatus) => {
  switch (status) {
    case 'active':
      return 'Enabled';
    case 'inactive':
      return 'Disabled';
    default:
      return 'Unknown';
  }
};

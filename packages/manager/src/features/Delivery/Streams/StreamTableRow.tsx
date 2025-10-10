import { Hidden } from '@linode/ui';
import * as React from 'react';

import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { Link } from 'src/components/Link';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import {
  getDestinationTypeOption,
  getStreamTypeOption,
} from 'src/features/Delivery/deliveryUtils';
import { StreamActionMenu } from 'src/features/Delivery/Streams/StreamActionMenu';

import type { Handlers as StreamHandlers } from './StreamActionMenu';
import type { Stream, StreamStatus } from '@linode/api-v4';

interface StreamTableRowProps extends StreamHandlers {
  stream: Stream;
}

export const StreamTableRow = React.memo((props: StreamTableRowProps) => {
  const { stream, onDelete, onDisableOrEnable, onEdit } = props;
  const { id, status } = stream;

  return (
    <TableRow key={id}>
      <TableCell>
        <Link to={`/logs/delivery/streams/${id}/edit`}>{stream.label}</Link>
      </TableCell>
      <TableCell>{getStreamTypeOption(stream.type)?.label}</TableCell>
      <TableCell statusCell>
        <StatusIcon status={status} />
        {humanizeStreamStatus(status)}
      </TableCell>
      <TableCell>{id}</TableCell>
      <Hidden smDown>
        <TableCell>
          {getDestinationTypeOption(stream.destinations[0]?.type)?.label}
        </TableCell>
      </Hidden>
      <Hidden lgDown>
        <TableCell>
          <DateTimeDisplay value={stream.created} />
        </TableCell>
      </Hidden>
      <TableCell actionCell>
        <StreamActionMenu
          onDelete={onDelete}
          onDisableOrEnable={onDisableOrEnable}
          onEdit={onEdit}
          stream={stream}
        />
      </TableCell>
    </TableRow>
  );
});

const humanizeStreamStatus = (status: StreamStatus) => {
  switch (status) {
    case 'active':
      return 'Active';
    case 'inactive':
      return 'Inactive';
    default:
      return 'Unknown';
  }
};

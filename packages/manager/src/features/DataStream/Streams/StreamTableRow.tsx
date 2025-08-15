import { Hidden } from '@linode/ui';
import * as React from 'react';

import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import {
  getDestinationTypeOption,
  getStreamTypeOption,
} from 'src/features/DataStream/dataStreamUtils';
import { StreamActionMenu } from 'src/features/DataStream/Streams/StreamActionMenu';

import type { Handlers as StreamHandlers } from './StreamActionMenu';
import type { Stream, StreamStatus } from '@linode/api-v4';

interface StreamTableRowProps extends StreamHandlers {
  stream: Stream;
}

export const StreamTableRow = React.memo((props: StreamTableRowProps) => {
  const { stream, onDelete, onDisableOrEnable, onEdit } = props;

  return (
    <TableRow key={stream.id}>
      <TableCell>{stream.label}</TableCell>
      <TableCell>{getStreamTypeOption(stream.type)?.label}</TableCell>
      <TableCell statusCell>
        <StatusIcon status={stream.status} />
        {humanizeStreamStatus(stream.status)}
      </TableCell>
      <TableCell>{stream.id}</TableCell>
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
      return 'Enabled';
    case 'inactive':
      return 'Disabled';
    default:
      return 'Unknown';
  }
};

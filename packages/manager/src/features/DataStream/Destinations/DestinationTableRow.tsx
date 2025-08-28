import { Hidden } from '@linode/ui';
import * as React from 'react';

import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { getDestinationTypeOption } from 'src/features/DataStream/dataStreamUtils';
import { DestinationActionMenu } from 'src/features/DataStream/Destinations/DestinationActionMenu';

import type { DestinationHandlers } from './DestinationActionMenu';
import type { Destination } from '@linode/api-v4';

interface DestinationTableRowProps extends DestinationHandlers {
  destination: Destination;
}

export const DestinationTableRow = React.memo(
  (props: DestinationTableRowProps) => {
    const { destination, onDelete, onEdit } = props;

    return (
      <TableRow key={destination.id}>
        <TableCell>{destination.label}</TableCell>
        <TableCell>
          {getDestinationTypeOption(destination.type)?.label}
        </TableCell>
        <TableCell>{destination.id}</TableCell>
        <Hidden smDown>
          <TableCell>
            <DateTimeDisplay value={destination.created} />
          </TableCell>
        </Hidden>
        <TableCell>
          <DateTimeDisplay value={destination.updated} />
        </TableCell>
        <TableCell actionCell>
          <DestinationActionMenu
            destination={destination}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        </TableCell>
      </TableRow>
    );
  }
);

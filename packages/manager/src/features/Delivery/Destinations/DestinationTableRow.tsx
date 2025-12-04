import { Hidden } from '@linode/ui';
import * as React from 'react';

import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { Link } from 'src/components/Link';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { getDestinationTypeOption } from 'src/features/Delivery/deliveryUtils';
import { DestinationActionMenu } from 'src/features/Delivery/Destinations/DestinationActionMenu';

import type { Destination } from '@linode/api-v4';
import type { DestinationHandlers } from 'src/features/Delivery/Destinations/DestinationActionMenu';

interface DestinationTableRowProps extends DestinationHandlers {
  destination: Destination;
}

export const DestinationTableRow = React.memo(
  (props: DestinationTableRowProps) => {
    const { destination, onDelete, onEdit } = props;
    const { id } = destination;

    return (
      <TableRow key={id}>
        <TableCell>
          <Link
            pendoId="Logs Delivery Destinations-Name"
            to={`/logs/delivery/destinations/${id}/edit`}
          >
            {destination.label}
          </Link>
        </TableCell>
        <TableCell>
          {getDestinationTypeOption(destination.type)?.label}
        </TableCell>
        <TableCell>{id}</TableCell>
        <Hidden smDown>
          <TableCell>
            <DateTimeDisplay value={destination.created} />
          </TableCell>
        </Hidden>
        <TableCell>
          <DateTimeDisplay value={destination.updated} />
        </TableCell>
        <Hidden lgDown>
          <TableCell>{destination.updated_by}</TableCell>
        </Hidden>
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

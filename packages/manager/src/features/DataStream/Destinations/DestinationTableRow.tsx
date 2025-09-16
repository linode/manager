import { Hidden } from '@linode/ui';
import * as React from 'react';

import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { Link } from 'src/components/Link';
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
    const { id } = destination;

    return (
      <TableRow key={id}>
        <TableCell>
          <Link to={`/datastream/destinations/${id}/edit`}>
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

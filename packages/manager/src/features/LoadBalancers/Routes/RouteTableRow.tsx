import * as React from 'react';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { RouteActionMenu } from './RouteActionMenu';
import type { RouteActionHandlers } from './RouteActionMenu';
import type { Route } from '@linode/api-v4/lib/aglb/types';

interface Props {
  route: Route;
}

type RouteTableRowProps = Props & RouteActionHandlers;

export const RouteTableRow = React.memo((props: RouteTableRowProps) => {
  const { route, onDelete, onEdit } = props;

  return (
    <TableRow key={route.id} data-qa-route-cell={route.id}>
      <TableCell parentColumn="Label">{route.label}</TableCell>
      {/* TODO: AGLB - match type is not currently returned anywhere in the API */}
      <TableCell parentColumn="Match Type">TBD</TableCell>
      <TableCell parentColumn="Service Targets">
        {/* TODO: AGLB - it is still unclear what will end up in this column */}
      </TableCell>
      <TableCell actionCell>
        <RouteActionMenu route={route} onDelete={onDelete} onEdit={onEdit} />
      </TableCell>
    </TableRow>
  );
});

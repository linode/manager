import * as React from 'react';
import { CircleProgress } from 'src/components/CircleProgress';
import { DocumentTitleSegment } from 'src/components/DocumentTitle/DocumentTitle';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { RouteTableRow } from '../RouteTableRow';
import { Table } from 'src/components/Table';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableBody } from 'src/components/TableBody';
import { TableSortCell } from 'src/components/TableSortCell';
import { TableCell } from 'src/components/TableCell';
import { useOrder } from 'src/hooks/useOrder';
import { usePagination } from 'src/hooks/usePagination';
import { useRoutesQuery } from 'src/queries/aglb/routes';
import type { Route } from '@linode/api-v4';

const PREFERENCE_KEY = 'aglb-routes';

const RouteLanding = () => {
  const pagination = usePagination(1, PREFERENCE_KEY);
  const { order, orderBy, handleOrderChange } = useOrder(
    {
      orderBy: 'label',
      order: 'asc',
    },
    `${PREFERENCE_KEY}-order`
  );
  const filter = {
    ['+order_by']: orderBy,
    ['+order']: order,
  };
  const { data: routes, error, isLoading } = useRoutesQuery(
    {
      page: pagination.page,
    },
    filter
  );

  const onEdit = (route: Route) => {
    // TODO: AGLB - does this trigger an edit modal? We need UX
    return () => null;
  };

  const onDelete = (route: Route) => {
    // TODO: AGLB - does this trigger a delete modal with confirmation? We need UX
    return () => null;
  };

  if (isLoading) {
    return <CircleProgress />;
  }

  if (error) {
    return (
      <ErrorState errorText="There was an error retrieving your domains. Please reload and try again." />
    );
  }

  return (
    <>
      <DocumentTitleSegment segment="Routes" />
      <Table data-testid="aglb-route-landing-table">
        <TableHead>
          <TableRow>
            <TableSortCell
              active={orderBy === 'label'}
              direction={order}
              label="label"
              handleClick={handleOrderChange}
            >
              Label
            </TableSortCell>
            <TableSortCell
              active={orderBy === 'Match Type'}
              direction={order}
              label="Match Type"
              handleClick={handleOrderChange}
            >
              Match Type
            </TableSortCell>
            <TableSortCell
              active={orderBy === 'Service Targets'}
              direction={order}
              label="Service Targets"
              handleClick={handleOrderChange}
            >
              Service Targets
            </TableSortCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {routes?.data.map((route: Route) => {
            return (
              <RouteTableRow
                key={`route-tablerow-${route.id}`}
                route={route}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            );
          })}
        </TableBody>
      </Table>
    </>
  );
};

export default RouteLanding;

import * as React from 'react';
import { DocumentTitleSegment } from 'src/components/DocumentTitle/DocumentTitle';
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

  console.log('routes', routes);

  return (
    <>
      <DocumentTitleSegment segment="Routes" />
      <Table>
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
              active={orderBy === 'status'}
              direction={order}
              label="status"
              handleClick={handleOrderChange}
            >
              Match Type
            </TableSortCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {routes?.data.map((route: Route) => (
            <TableRow key={route.id} data-qa-route-cell={route.id}>
              <TableCell parentColumn="Label">{route.label}</TableCell>
              <TableCell parentColumn="Match Type">match type</TableCell>
              <TableCell>
                {/* <ActionMenu
                  routeId={route.id}
                  routeType={route.type}
                  routeStatus={route.status}
                  routeDomain={route.domain}
                  routePath={route.path}
                  routeServiceId={route.id}
                /> */}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
};

export default RouteLanding;

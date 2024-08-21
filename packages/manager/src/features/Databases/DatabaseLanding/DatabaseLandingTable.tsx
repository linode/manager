import React from 'react';

import { Hidden } from 'src/components/Hidden';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableSortCell } from 'src/components/TableSortCell';
import DatabaseLogo from 'src/features/Databases/DatabaseLanding/DatabaseLogo';
import DatabaseRow from 'src/features/Databases/DatabaseLanding/DatabaseRow';
import { usePagination } from 'src/hooks/usePagination';
import { useInProgressEvents } from 'src/queries/events/events';

import type {
  DatabaseInstance,
  DatabaseType,
} from '@linode/api-v4/lib/databases';
import type { Order } from 'src/hooks/useOrder';

const preferenceKey = 'databases';

interface Props {
  data: DatabaseInstance[] | undefined;
  handleOrderChange: (newOrderBy: string, newOrder: Order) => void;
  isADatabases?: boolean;
  order: 'asc' | 'desc';
  orderBy: string;
  types: DatabaseType[] | undefined;
}
const DatabaseLandingTable = ({
  data,
  handleOrderChange,
  isADatabases,
  order,
  orderBy,
  types,
}: Props) => {
  const { data: events } = useInProgressEvents();

  const pagination = usePagination(1, preferenceKey);

  return (
    <>
      <Table sx={{ marginTop: '10px' }}>
        <TableHead>
          <TableRow>
            <TableSortCell
              active={orderBy === 'label'}
              direction={order}
              handleClick={handleOrderChange}
              label="label"
            >
              Cluster Label
            </TableSortCell>
            <TableSortCell
              active={orderBy === 'status'}
              direction={order}
              handleClick={handleOrderChange}
              label="status"
            >
              Status
            </TableSortCell>
            {isADatabases && (
              /* TODO add back TableSortCell once API is updated to support sort by Plan */
              <TableCell>Plan</TableCell>
            )}
            <Hidden smDown>
              <TableSortCell
                active={orderBy === 'cluster_size'}
                direction={order}
                handleClick={handleOrderChange}
                label="cluster_size"
              >
                {isADatabases ? 'Nodes' : 'Configuration'}
              </TableSortCell>
            </Hidden>
            <TableSortCell
              active={orderBy === 'engine'}
              direction={order}
              handleClick={handleOrderChange}
              label="engine"
            >
              Engine
            </TableSortCell>
            <Hidden mdDown>
              {/* TODO add back TableSortCell once API is updated to support sort by Region */}
              <TableCell>Region</TableCell>
            </Hidden>
            <Hidden lgDown>
              <TableSortCell
                active={orderBy === 'created'}
                direction={order}
                handleClick={handleOrderChange}
                label="created"
              >
                Created
              </TableSortCell>
            </Hidden>
          </TableRow>
        </TableHead>
        <TableBody>
          {data?.map((database: DatabaseInstance) => (
            <DatabaseRow
              database={database}
              events={events}
              isADatabases={isADatabases}
              key={database.id}
              types={types}
            />
          ))}
          {data?.length === 0 && (
            <TableRowEmpty
              message={
                isADatabases
                  ? 'You don’t have any Aiven Database Clusters created yet. Click Create Database Cluster to do create one.'
                  : ''
              }
              colSpan={7}
            ></TableRowEmpty>
          )}
        </TableBody>
      </Table>
      <PaginationFooter
        count={data?.length || 0}
        eventCategory="Databases Table"
        handlePageChange={pagination.handlePageChange}
        handleSizeChange={pagination.handlePageSizeChange}
        page={pagination.page}
        pageSize={pagination.pageSize}
      />
      {isADatabases && <DatabaseLogo />}
    </>
  );
};

export default DatabaseLandingTable;

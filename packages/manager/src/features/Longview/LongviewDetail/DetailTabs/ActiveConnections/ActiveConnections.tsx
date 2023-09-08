import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';

import OrderBy from 'src/components/OrderBy';
import Paginate from 'src/components/Paginate';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import { TableSortCell } from 'src/components/TableSortCell';
import { Typography } from 'src/components/Typography';
import { LongviewPort } from 'src/features/Longview/request.types';

import { ConnectionRow } from './ConnectionRow';

export interface TableProps {
  connections: LongviewPort[];
  connectionsError?: string;
  connectionsLoading: boolean;
}

export const ActiveConnections = (props: TableProps) => {
  const { connections, connectionsError, connectionsLoading } = props;
  const theme = useTheme();

  return (
    <Grid
      md={4}
      sx={{
        boxSizing: 'border-box',
        margin: '0',
        [theme.breakpoints.down('md')]: {
          marginTop: theme.spacing(3),
        },
      }}
      xs={12}
    >
      <Typography
        sx={{
          [theme.breakpoints.down('lg')]: {
            marginLeft: theme.spacing(),
            marginRight: theme.spacing(),
          },
        }}
        variant="h2"
      >
        Active Connections
      </Typography>
      <ConnectionsTable
        connections={connections}
        connectionsError={connectionsError}
        connectionsLoading={connectionsLoading}
      />
    </Grid>
  );
};

export const ConnectionsTable = (props: TableProps) => {
  const { connections, connectionsError, connectionsLoading } = props;

  return (
    <OrderBy
      data={connections}
      order={'asc'}
      orderBy={'process'}
      preferenceKey={'active-connections'}
    >
      {({ data: orderedData, handleOrderChange, order, orderBy }) => (
        <Paginate data={orderedData} pageSize={25}>
          {({
            count,
            data: paginatedData,
            handlePageChange,
            handlePageSizeChange,
            page,
            pageSize,
          }) => (
            <>
              <Table spacingTop={16}>
                <TableHead>
                  <TableRow>
                    <TableSortCell
                      active={orderBy === 'name'}
                      data-qa-table-header="Name"
                      direction={order}
                      handleClick={handleOrderChange}
                      label="name"
                    >
                      Name
                    </TableSortCell>
                    <TableSortCell
                      active={orderBy === 'user'}
                      data-qa-table-header="User"
                      direction={order}
                      handleClick={handleOrderChange}
                      label="user"
                    >
                      User
                    </TableSortCell>
                    <TableSortCell
                      active={orderBy === 'count'}
                      data-qa-table-header="Count"
                      direction={order}
                      handleClick={handleOrderChange}
                      label="count"
                    >
                      Count
                    </TableSortCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {renderLoadingErrorData(
                    connectionsLoading,
                    paginatedData,
                    connectionsError
                  )}
                </TableBody>
              </Table>
              <PaginationFooter
                count={count}
                eventCategory="Longview active connections"
                handlePageChange={handlePageChange}
                handleSizeChange={handlePageSizeChange}
                page={page}
                pageSize={pageSize}
              />
            </>
          )}
        </Paginate>
      )}
    </OrderBy>
  );
};

const renderLoadingErrorData = (
  loading: boolean,
  data: LongviewPort[],
  error?: string
) => {
  if (error) {
    return <TableRowError colSpan={12} message={error} />;
  }
  if (loading) {
    return <TableRowLoading columns={3} />;
  }
  if (data.length === 0) {
    return <TableRowEmpty colSpan={12} message={'No active connections.'} />;
  }

  return data.map((thisConnection, idx) => (
    <ConnectionRow
      connection={thisConnection}
      key={`longview-active-connection-${idx}`}
    />
  ));
};

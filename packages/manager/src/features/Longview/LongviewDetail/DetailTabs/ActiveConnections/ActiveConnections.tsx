import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import OrderBy from 'src/components/OrderBy';
import Paginate from 'src/components/Paginate';
import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table';
import TableRow from 'src/components/TableRow';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import TableRowLoading from 'src/components/TableRowLoading';
import TableSortCell from 'src/components/TableSortCell';
import { longviewPortFactory } from 'src/factories/longviewService';
import { LongviewPort } from 'src/features/Longview/request.types';
import ConnectionRow from './ConnectionRow';

const useStyles = makeStyles((theme: Theme) => ({
  table: {}
}));

export interface Props {}

const mockConnections = longviewPortFactory.buildList(5);

export const ActiveConnections: React.FC<Props> = props => {
  return (
    <Grid item xs={4} md={4}>
      <Typography variant="h2">Active Connections</Typography>
      <Grid item>
        <ConnectionsTable
          connections={mockConnections}
          connectionsLoading={false}
          connectionsError={undefined}
        />
      </Grid>
    </Grid>
  );
};

export interface TableProps {
  connections: LongviewPort[];
  connectionsLoading: boolean;
  connectionsError?: string;
}

export const ConnectionsTable: React.FC<TableProps> = props => {
  const { connections, connectionsLoading, connectionsError } = props;
  const classes = useStyles();

  return (
    <OrderBy data={connections} orderBy={'process'} order={'asc'}>
      {({ data: orderedData, handleOrderChange, order, orderBy }) => (
        <Paginate data={orderedData} pageSize={25}>
          {({
            data: paginatedData,
            count,
            handlePageChange,
            handlePageSizeChange,
            page,
            pageSize
          }) => (
            <>
              <Table spacingTop={16} tableClass={classes.table}>
                <TableHead>
                  <TableRow>
                    <TableSortCell
                      data-qa-table-header="Name"
                      active={orderBy === 'name'}
                      label="name"
                      direction={order}
                      handleClick={handleOrderChange}
                    >
                      Name
                    </TableSortCell>
                    <TableSortCell
                      data-qa-table-header="User"
                      active={orderBy === 'user'}
                      label="user"
                      direction={order}
                      handleClick={handleOrderChange}
                    >
                      User
                    </TableSortCell>
                    <TableSortCell
                      data-qa-table-header="Count"
                      active={orderBy === 'count'}
                      label="count"
                      direction={order}
                      handleClick={handleOrderChange}
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
                page={page}
                pageSize={pageSize}
                handlePageChange={handlePageChange}
                handleSizeChange={handlePageSizeChange}
                eventCategory="Longview active connections"
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
    return <TableRowLoading colSpan={4} />;
  }
  if (data.length === 0) {
    return <TableRowEmptyState colSpan={12} />;
  }

  return data.map((thisConnection, idx) => (
    <ConnectionRow
      key={`longview-active-connection-${idx}`}
      connection={thisConnection}
    />
  ));
};

export default ActiveConnections;

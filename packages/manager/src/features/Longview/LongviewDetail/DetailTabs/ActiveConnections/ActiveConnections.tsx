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
import TableRow_PreCMR from 'src/components/TableRow';
import TableRow_CMR from 'src/components/TableRow/TableRow_CMR';
import TableRowEmptyState_PreCMR from 'src/components/TableRowEmptyState';
import TableRowEmptyState_CMR from 'src/components/TableRowEmptyState/TableRowEmptyState_CMR';
import TableRowError_PreCMR from 'src/components/TableRowError';
import TableRowError_CMR from 'src/components/TableRowError/TableRowError_CMR';
import TableRowLoading_PreCMR from 'src/components/TableRowLoading';
import TableRowLoading_CMR from 'src/components/TableRowLoading/TableRowLoading_CMR';
import TableSortCell_PreCMR from 'src/components/TableSortCell';
import TableSortCell_CMR from 'src/components/TableSortCell/TableSortCell_CMR';
import { LongviewPort } from 'src/features/Longview/request.types';
import useFlags from 'src/hooks/useFlags';
import ConnectionRow from './ConnectionRow';

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    [theme.breakpoints.down('sm')]: {
      marginTop: theme.spacing(3),
    },
  },
  table: {
    [theme.breakpoints.down('sm')]: {
      '& tbody > tr > td:first-child .data': {
        textAlign: 'right',
      },
    },
    [theme.breakpoints.up('md')]: {
      '& thead > tr > th:last-child': {
        textAlign: 'right',
      },
      '& tbody > tr > td:last-child': {
        textAlign: 'right',
      },
    },
  },
  cmrSpacing: {
    [theme.breakpoints.down('md')]: {
      marginLeft: theme.spacing(),
      marginRight: theme.spacing(),
    },
  },
}));

export interface TableProps {
  connections: LongviewPort[];
  connectionsLoading: boolean;
  connectionsError?: string;
  cmrFlag?: boolean;
}

export const ActiveConnections: React.FC<TableProps> = (props) => {
  const { connections, connectionsError, connectionsLoading, cmrFlag } = props;
  const classes = useStyles();
  const flags = useFlags();

  return (
    <Grid item xs={12} md={4} className={classes.container}>
      <Typography className={flags.cmr ? classes.cmrSpacing : ''} variant="h2">
        Active Connections
      </Typography>
      <ConnectionsTable
        connections={connections}
        connectionsLoading={connectionsLoading}
        connectionsError={connectionsError}
        cmrFlag={cmrFlag}
      />
    </Grid>
  );
};
export const ConnectionsTable: React.FC<TableProps> = (props) => {
  const { connections, connectionsLoading, connectionsError, cmrFlag } = props;
  const classes = useStyles();

  const TableRow = cmrFlag ? TableRow_CMR : TableRow_PreCMR;
  const TableSortCell = cmrFlag ? TableSortCell_CMR : TableSortCell_PreCMR;

  return (
    <OrderBy
      data={connections}
      orderBy={'process'}
      order={'asc'}
      preferenceKey={'active-connections'}
    >
      {({ data: orderedData, handleOrderChange, order, orderBy }) => (
        <Paginate data={orderedData} pageSize={25}>
          {({
            data: paginatedData,
            count,
            handlePageChange,
            handlePageSizeChange,
            page,
            pageSize,
          }) => (
            <>
              <Table
                spacingTop={16}
                tableClass={`${
                  connections.length > 0 && !cmrFlag ? classes.table : ''
                }`}
              >
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
                    connectionsError,
                    cmrFlag
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
  error?: string,
  cmrFlag?: boolean
) => {
  const TableRowError = cmrFlag ? TableRowError_CMR : TableRowError_PreCMR;
  const TableRowLoading = cmrFlag
    ? TableRowLoading_CMR
    : TableRowLoading_PreCMR;
  const TableRowEmptyState = cmrFlag
    ? TableRowEmptyState_CMR
    : TableRowEmptyState_PreCMR;

  if (error) {
    return <TableRowError colSpan={12} message={error} />;
  }
  if (loading) {
    return <TableRowLoading colSpan={4} />;
  }
  if (data.length === 0) {
    return (
      <TableRowEmptyState colSpan={12} message={'No active connections.'} />
    );
  }

  return data.map((thisConnection, idx) => (
    <ConnectionRow
      key={`longview-active-connection-${idx}`}
      connection={thisConnection}
      cmrFlag={cmrFlag}
    />
  ));
};

export default ActiveConnections;

import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import OrderBy from 'src/components/OrderBy';
import Paginate from 'src/components/Paginate';
import PaginationFooter from 'src/components/PaginationFooter';
import Table_PreCMR from 'src/components/Table';
import Table_CMR from 'src/components/Table/Table_CMR';
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
import { LongviewService } from 'src/features/Longview/request.types';
import useFlags from 'src/hooks/useFlags';
import LongviewServiceRow from './LongviewServiceRow';

const useStyles = makeStyles((theme: Theme) => ({
  table: {
    [theme.breakpoints.down('sm')]: {
      '& tbody > tr > td:first-child .data': {
        textAlign: 'right'
      }
    },
    [theme.breakpoints.up('md')]: {
      '& thead > tr > th:last-child': {
        textAlign: 'right'
      },
      '& tbody > tr > td:last-child': {
        textAlign: 'right'
      }
    }
  },
  cmrSpacing: {
    [theme.breakpoints.down('md')]: {
      marginLeft: theme.spacing()
    }
  }
}));

export interface TableProps {
  services: LongviewService[];
  servicesLoading: boolean;
  servicesError?: string;
  cmrFlag?: boolean;
}

export const ListeningServices: React.FC<TableProps> = props => {
  const classes = useStyles();
  const flags = useFlags();

  const { services, servicesError, servicesLoading, cmrFlag } = props;
  return (
    <Grid item xs={12} md={8}>
      <Typography variant="h2" className={flags.cmr ? classes.cmrSpacing : ''}>
        Listening Services
      </Typography>
      <ServicesTable
        services={services}
        servicesLoading={servicesLoading}
        servicesError={servicesError}
        cmrFlag={cmrFlag}
      />
    </Grid>
  );
};

export const ServicesTable: React.FC<TableProps> = props => {
  const { services, servicesError, servicesLoading, cmrFlag } = props;
  const classes = useStyles();

  const Table = cmrFlag ? Table_CMR : Table_PreCMR;
  const TableRow = cmrFlag ? TableRow_CMR : TableRow_PreCMR;
  const TableSortCell = cmrFlag ? TableSortCell_CMR : TableSortCell_PreCMR;

  return (
    <OrderBy
      data={services}
      orderBy={'process'}
      order={'asc'}
      preferenceKey={'listening-services'}
    >
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
              <Table
                spacingTop={16}
                tableClass={`${
                  services.length > 0 && !cmrFlag ? classes.table : ''
                }`}
              >
                <TableHead>
                  <TableRow>
                    <TableSortCell
                      data-qa-table-header="Process"
                      active={orderBy === 'name'}
                      label="name"
                      direction={order}
                      handleClick={handleOrderChange}
                      style={{ width: '25%' }}
                    >
                      Process
                    </TableSortCell>
                    <TableSortCell
                      data-qa-table-header="User"
                      active={orderBy === 'user'}
                      label="user"
                      direction={order}
                      handleClick={handleOrderChange}
                      style={{ width: '25%' }}
                    >
                      User
                    </TableSortCell>
                    <TableSortCell
                      data-qa-table-header="Protocol"
                      active={orderBy === 'type'}
                      label="type"
                      direction={order}
                      handleClick={handleOrderChange}
                      style={{ width: '15%' }}
                    >
                      Protocol
                    </TableSortCell>
                    <TableSortCell
                      data-qa-table-header="Port"
                      active={orderBy === 'port'}
                      label="port"
                      direction={order}
                      handleClick={handleOrderChange}
                      style={{ width: '10%' }}
                    >
                      Port
                    </TableSortCell>
                    <TableSortCell
                      data-qa-table-header="IP"
                      active={orderBy === 'ip'}
                      label="ip"
                      direction={order}
                      handleClick={handleOrderChange}
                      style={{ width: '25%' }}
                    >
                      IP
                    </TableSortCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {renderLoadingErrorData(
                    servicesLoading,
                    paginatedData,
                    servicesError,
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
  data: LongviewService[],
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
    return <TableRowLoading colSpan={6} />;
  }
  if (data.length === 0) {
    return <TableRowEmptyState colSpan={12} message="No listening services." />;
  }

  return data.map((thisService, idx) => (
    <LongviewServiceRow
      key={`longview-service-${idx}`}
      service={thisService}
      cmrFlag={cmrFlag}
    />
  ));
};

export default ListeningServices;

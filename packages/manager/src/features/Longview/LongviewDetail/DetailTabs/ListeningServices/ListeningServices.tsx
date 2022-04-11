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
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import TableSortCell from 'src/components/TableSortCell';
import { LongviewService } from 'src/features/Longview/request.types';
import LongviewServiceRow from './LongviewServiceRow';

const useStyles = makeStyles((theme: Theme) => ({
  title: {
    [theme.breakpoints.down('md')]: {
      marginLeft: theme.spacing(),
    },
  },
}));

export interface TableProps {
  services: LongviewService[];
  servicesLoading: boolean;
  servicesError?: string;
}

export const ListeningServices: React.FC<TableProps> = (props) => {
  const classes = useStyles();

  const { services, servicesError, servicesLoading } = props;

  return (
    <Grid item xs={12} md={8}>
      <Typography variant="h2" className={classes.title}>
        Listening Services
      </Typography>
      <ServicesTable
        services={services}
        servicesLoading={servicesLoading}
        servicesError={servicesError}
      />
    </Grid>
  );
};

export const ServicesTable: React.FC<TableProps> = (props) => {
  const { services, servicesError, servicesLoading } = props;

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
            pageSize,
          }) => (
            <>
              <Table spacingTop={16}>
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
                    servicesError
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
  error?: string
) => {
  if (error) {
    return <TableRowError colSpan={12} message={error} />;
  }
  if (loading) {
    return <TableRowLoading columns={5} />;
  }
  if (data.length === 0) {
    return <TableRowEmptyState colSpan={12} message="No listening services." />;
  }

  return data.map((thisService, idx) => (
    <LongviewServiceRow key={`longview-service-${idx}`} service={thisService} />
  ));
};

export default ListeningServices;

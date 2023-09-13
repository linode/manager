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
import { LongviewService } from 'src/features/Longview/request.types';

import { LongviewServiceRow } from './LongviewServiceRow';

export interface TableProps {
  services: LongviewService[];
  servicesError?: string;
  servicesLoading: boolean;
}

export const ListeningServices = (props: TableProps) => {
  const { services, servicesError, servicesLoading } = props;

  return (
    <Grid md={8} xs={12}>
      <Typography
        sx={(theme) => ({
          [theme.breakpoints.down('lg')]: {
            marginLeft: theme.spacing(),
          },
        })}
        variant="h2"
      >
        Listening Services
      </Typography>
      <ServicesTable
        services={services}
        servicesError={servicesError}
        servicesLoading={servicesLoading}
      />
    </Grid>
  );
};

export const ServicesTable = (props: TableProps) => {
  const { services, servicesError, servicesLoading } = props;

  return (
    <OrderBy
      data={services}
      order={'asc'}
      orderBy={'process'}
      preferenceKey={'listening-services'}
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
                      data-qa-table-header="Process"
                      direction={order}
                      handleClick={handleOrderChange}
                      label="name"
                      style={{ width: '25%' }}
                    >
                      Process
                    </TableSortCell>
                    <TableSortCell
                      active={orderBy === 'user'}
                      data-qa-table-header="User"
                      direction={order}
                      handleClick={handleOrderChange}
                      label="user"
                      style={{ width: '25%' }}
                    >
                      User
                    </TableSortCell>
                    <TableSortCell
                      active={orderBy === 'type'}
                      data-qa-table-header="Protocol"
                      direction={order}
                      handleClick={handleOrderChange}
                      label="type"
                      style={{ width: '15%' }}
                    >
                      Protocol
                    </TableSortCell>
                    <TableSortCell
                      active={orderBy === 'port'}
                      data-qa-table-header="Port"
                      direction={order}
                      handleClick={handleOrderChange}
                      label="port"
                      style={{ width: '10%' }}
                    >
                      Port
                    </TableSortCell>
                    <TableSortCell
                      active={orderBy === 'ip'}
                      data-qa-table-header="IP"
                      direction={order}
                      handleClick={handleOrderChange}
                      label="ip"
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
    return <TableRowEmpty colSpan={12} message="No listening services." />;
  }

  return data.map((thisService, idx) => (
    <LongviewServiceRow key={`longview-service-${idx}`} service={thisService} />
  ));
};

import { Grid, TableBody, TableHead } from '@mui/material';
import * as React from 'react';

import OrderBy from 'src/components/OrderBy';
import Paginate from 'src/components/Paginate';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableCell } from 'src/components/TableCell';
import { TableContentWrapper } from 'src/components/TableContentWrapper/TableContentWrapper';
import { TableRow } from 'src/components/TableRow';
import { TableSortCell } from 'src/components/TableSortCell';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import { AlertTableRow } from './AlertTableRow';
import { AlertListingTableLabelMap } from './constants';

import type { Item } from '../constants';
import type { APIError, Alert, AlertServiceType } from '@linode/api-v4';

export interface AlertsListTableProps {
  alerts: Alert[];
  error?: APIError[];
  isLoading: boolean;
  services: Item<string, AlertServiceType>[];
}

export const AlertsListTable = React.memo((props: AlertsListTableProps) => {
  const { alerts, error, isLoading, services } = props;
  const _error = error
    ? getAPIErrorOrDefault(error, 'Error in fetching the alerts')
    : undefined;

  return (
    <OrderBy data={alerts} order="asc" orderBy={'service'}>
      {({ data: orderedData, handleOrderChange, order, orderBy }) => (
        <Paginate data={orderedData}>
          {({
            count,
            data: paginatedAndOrderedAlerts,
            handlePageChange,
            handlePageSizeChange,
            page,
            pageSize,
          }) => (
            <>
              <Grid marginTop={2}>
                <Table colCount={7} size="small">
                  <TableHead>
                    <TableRow>
                      {AlertListingTableLabelMap.map((value) => (
                        <TableSortCell
                          active={orderBy === value.label}
                          direction={order}
                          handleClick={handleOrderChange}
                          key={value.label}
                          label={value.label}
                        >
                          {value.colName}
                        </TableSortCell>
                      ))}
                      <TableCell actionCell />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableContentWrapper
                      error={_error}
                      length={paginatedAndOrderedAlerts.length}
                      loading={isLoading}
                      loadingProps={{ columns: 6 }}
                    />
                    {paginatedAndOrderedAlerts?.map((alert) => (
                      <AlertTableRow
                        alert={alert}
                        key={alert.id}
                        services={services}
                      />
                    ))}
                  </TableBody>
                </Table>
              </Grid>
              <PaginationFooter
                count={count}
                eventCategory="Alert Definitions Table"
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
});

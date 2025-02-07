import { Grid, TableBody, TableHead } from '@mui/material';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

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
  /**
   * The list of alerts to display
   */
  alerts: Alert[];
  /**
   * An error to display if there was an issue fetching the alerts
   */
  error?: APIError[];
  /**
   * A boolean indicating whether the alerts are loading
   */
  isLoading: boolean;
  /**
   * The list of services to display in the table
   */
  services: Item<string, AlertServiceType>[];
}

export const AlertsListTable = React.memo((props: AlertsListTableProps) => {
  const { alerts, error, isLoading, services } = props;
  const _error = error
    ? getAPIErrorOrDefault(error, 'Error in fetching the alerts.')
    : undefined;
  const history = useHistory();

  const handleDetails = ({ id: _id, service_type: serviceType }: Alert) => {
    history.push(`${location.pathname}/detail/${serviceType}/${_id}`);
  };

  const handleEdit = ({ id, service_type: serviceType }: Alert) => {
    history.push(`${location.pathname}/edit/${serviceType}/${id}`);
  };

  return (
    <OrderBy
      data={alerts}
      order="asc"
      orderBy="service"
      preferenceKey="alerts-landing"
    >
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
                <Table colCount={7} data-qa="alert-table" size="small">
                  <TableHead>
                    <TableRow>
                      {AlertListingTableLabelMap.map((value) => (
                        <TableSortCell
                          active={orderBy === value.label}
                          data-qa-header={value.label}
                          data-qa-sorting={value.label}
                          direction={order}
                          handleClick={handleOrderChange}
                          key={value.label}
                          label={value.label}
                          noWrap
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
                        handlers={{
                          handleDetails: () => handleDetails(alert),
                          handleEdit: () => handleEdit(alert),
                        }}
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

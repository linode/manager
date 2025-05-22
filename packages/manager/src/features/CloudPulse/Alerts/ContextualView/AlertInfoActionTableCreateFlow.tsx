import { Box } from '@linode/ui';
import { Grid, TableBody, TableHead } from '@mui/material';
import React from 'react';

import OrderBy from 'src/components/OrderBy';
import Paginate from 'src/components/Paginate';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableCell } from 'src/components/TableCell';
import { TableContentWrapper } from 'src/components/TableContentWrapper/TableContentWrapper';
import { TableRow } from 'src/components/TableRow';
import { TableSortCell } from 'src/components/TableSortCell';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import { AlertInformationActionRow } from './AlertInformationActionRow';

import type { Alert, APIError, LinodeAclpAlertsPayload } from '@linode/api-v4';

export interface AlertInfoActionTableCreateFlowProps {
  /**
   * List of alerts to be displayed
   */
  alerts: Alert[];

  /**
   * List of table headers for each column
   */
  columns: TableColumnHeader[];

  /**
   * A mapping of enabled alert IDs grouped by alert type.
   * Used to determine the toggle status (on/off) for each alert row.
   * Only use in create flow.
   */
  enabledAlerts: LinodeAclpAlertsPayload;

  /**
   * Error received from API
   */
  error?: APIError[] | null;

  /**
   * Called when an alert is toggled on or off.
   * Only use in create flow.
   * @param alert object for which toggle button is click.
   */
  onToggleAlert: (alert: Alert) => void;

  /**
   * Column name by which columns will be ordered by default
   */
  orderByColumn: string;
}

export interface TableColumnHeader {
  /**
   * Name of the column to be displayed
   */
  columnName: string;

  /**
   * Corresponding key name in the alert object for which this column is
   */
  label: string;
}

export const AlertInfoActionTableCreateFlow = (
  props: AlertInfoActionTableCreateFlowProps
) => {
  const {
    alerts,
    columns,
    enabledAlerts,
    error,
    onToggleAlert,
    orderByColumn,
  } = props;

  const _error = error
    ? getAPIErrorOrDefault(error, 'Error while fetching the alerts')
    : undefined;

  return (
    <OrderBy data={alerts} order="asc" orderBy={orderByColumn}>
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
            <Box>
              <Grid>
                <Table
                  colCount={columns.length + 1}
                  data-testid="alert-table"
                  size="small"
                >
                  <TableHead>
                    <TableRow>
                      <TableCell actionCell />
                      {columns.map(({ columnName, label }) => {
                        return (
                          <TableSortCell
                            active={orderBy === label}
                            data-qa-header={label}
                            data-qa-sorting={label}
                            direction={order}
                            handleClick={handleOrderChange}
                            key={label}
                            label={label}
                          >
                            {columnName}
                          </TableSortCell>
                        );
                      })}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableContentWrapper
                      error={_error}
                      length={paginatedAndOrderedAlerts.length}
                      loading={false}
                    />
                    {paginatedAndOrderedAlerts?.map((alert) => (
                      <AlertInformationActionRow
                        alert={alert}
                        handleToggle={onToggleAlert}
                        key={alert.id}
                        status={enabledAlerts?.[alert.type].includes(alert.id)}
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
            </Box>
          )}
        </Paginate>
      )}
    </OrderBy>
  );
};

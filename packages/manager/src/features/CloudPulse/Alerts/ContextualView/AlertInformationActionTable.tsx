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

import type { APIError, Alert } from '@linode/api-v4';

export interface AlertInformationActionTableProps {
  /**
   * List of alerts to be displayed
   */
  alerts: Alert[];

  /**
   * List of table headers for each column
   */
  columns: TableColumnHeader[];

  /**
   * Id of the selected entity
   */
  entityId: string;

  /**
   * Name of the selected entity
   */
  entityName: string;

  /**
   * Error received from API
   */
  error?: APIError[] | null;

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

export interface AlertStatusMap {
  /**
   * Alert id to boolean mapping to hold whether that alert id is enabled or not
   */
  [alertId: number]: boolean;
}

// generate the mapping of id to whether entity present in entity_ids list or not for quick access in table row toggles
const generateStatusMap = (
  alerts: Alert[],
  entityId: string
): AlertStatusMap => {
  return alerts.reduce<AlertStatusMap>(
    (previousValue, alert) => ({
      ...previousValue,
      [alert.id]: alert.entity_ids.includes(entityId),
    }),
    {}
  );
};

export const AlertInformationActionTable = (
  props: AlertInformationActionTableProps
) => {
  const { alerts, columns, entityId, error, orderByColumn } = props;
  const [alertStatusMap, setAlertStatusMap] = React.useState<AlertStatusMap>(
    generateStatusMap(alerts, entityId)
  );

  const _error = error
    ? getAPIErrorOrDefault(error, 'Error while fetching the alerts')
    : undefined;

  const handleToggle = ({ id }: Alert) => {
    setAlertStatusMap((previousValue) => {
      return {
        ...previousValue,
        [id]: !previousValue[id],
      };
    });
  };
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
                        handleToggle={handleToggle}
                        key={alert.id}
                        status={alertStatusMap[alert.id]}
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

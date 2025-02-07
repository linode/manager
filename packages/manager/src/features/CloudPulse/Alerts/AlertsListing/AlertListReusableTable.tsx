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

import { AlertConfirmationDialog } from '../AlertsLanding/AlertConfirmationDialog';
import { AlertListReusableTableRow } from './AlertListReusableTableRow';

import type { Alert } from '@linode/api-v4';

export interface AlertListReusableTableProps {
  /**
   * list of alerts to be displayed
   */
  alerts: Alert[];

  /**
   * list of table headers for each column
   */
  columns: TableColumnHeader[];

  /**
   * id of the selected entity
   */
  entityId: string;

  /**
   * name of the selected entity
   */
  entityName: string;

  /**
   * column name by which columns will be ordered by default
   */
  ordeByColumn: string;
}

export interface TableColumnHeader {
  /**
   * Name of the column to be displayed
   */
  columnName: string;

  /**
   * corresponding key name in the alert object for which this column is
   */
  label: string;
}

export interface AlertStatusMap {
  /**
   * alert id to boolean mapping to hold whether that alert id is enabled or not
   */
  [alertId: number]: boolean;
}

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

export const AlertListReusableTable = (props: AlertListReusableTableProps) => {
  const { alerts, columns, entityId, entityName, ordeByColumn } = props;
  const [alertStatusMap, setAlertStatusMap] = React.useState<AlertStatusMap>(
    generateStatusMap(alerts, entityId)
  );

  const [selectedAlert, setSelectedAlert] = React.useState<Alert>({} as Alert);
  const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>(false);

  const handleCancel = () => {
    setIsDialogOpen(false);
  };

  const handleClose = (id: number) => {
    setIsDialogOpen(false);
    setAlertStatusMap((previousValue) => {
      return {
        ...previousValue,
        [id]: !previousValue[id],
      };
    });
  };

  const handleToggle = (alert: Alert) => {
    setIsDialogOpen(true);
    setSelectedAlert(alert);
  };
  return (
    <>
      <OrderBy data={alerts} order="asc" orderBy={ordeByColumn}>
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
                        length={paginatedAndOrderedAlerts.length}
                        loading={false}
                      />
                      {paginatedAndOrderedAlerts?.map((alert) => (
                        <AlertListReusableTableRow
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
      <AlertConfirmationDialog
        alertId={selectedAlert.id}
        alertName={selectedAlert.label}
        entityId={entityId}
        entityName={entityName}
        handleCancel={handleCancel}
        handleClose={handleClose}
        isActive={alertStatusMap[selectedAlert.id]}
        isOpen={isDialogOpen}
        serviceType={selectedAlert.service_type}
      />
    </>
  );
};

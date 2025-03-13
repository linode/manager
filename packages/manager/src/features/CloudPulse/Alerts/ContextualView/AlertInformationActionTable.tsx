import { Box } from '@linode/ui';
import { Grid, TableBody, TableHead } from '@mui/material';
import { useSnackbar } from 'notistack';
import React from 'react';

import OrderBy from 'src/components/OrderBy';
import Paginate from 'src/components/Paginate';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableCell } from 'src/components/TableCell';
import { TableContentWrapper } from 'src/components/TableContentWrapper/TableContentWrapper';
import { TableRow } from 'src/components/TableRow';
import { TableSortCell } from 'src/components/TableSortCell';
import {
  useAddEntityToAlert,
  useRemoveEntityFromAlert,
} from 'src/queries/cloudpulse/alerts';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import { AlertConfirmationDialog } from '../AlertsLanding/AlertConfirmationDialog';
import { AlertInformationActionRow } from './AlertInformationActionRow';

import type { APIError, Alert, EntityAlertUpdatePayload } from '@linode/api-v4';

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

export const AlertInformationActionTable = (
  props: AlertInformationActionTableProps
) => {
  const { alerts, columns, entityId, entityName, error, orderByColumn } = props;

  const _error = error
    ? getAPIErrorOrDefault(error, 'Error while fetching the alerts')
    : undefined;
  const { enqueueSnackbar } = useSnackbar();
  const [selectedAlert, setSelectedAlert] = React.useState<Alert>({} as Alert);
  const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const { mutateAsync: addEntity } = useAddEntityToAlert();

  const { mutateAsync: removeEntity } = useRemoveEntityFromAlert();

  const handleCancel = () => {
    setIsDialogOpen(false);
  };
  const handleConfirm = React.useCallback(
    (alert: Alert, currentStatus: boolean) => {
      const payload: EntityAlertUpdatePayload = {
        alert,
        entityId,
      };

      setIsLoading(true);
      (currentStatus ? removeEntity(payload) : addEntity(payload))
        .then(() => {
          enqueueSnackbar(
            `The alert settings for ${entityName} saved successfully.`,
            { variant: 'success' }
          );
        })
        .catch(() => {
          enqueueSnackbar(
            `${currentStatus ? 'Disabling' : 'Enabling'} alert failed.`,
            {
              variant: 'error',
            }
          );
        })
        .finally(() => {
          setIsLoading(false);
          setIsDialogOpen(false);
        });
    },
    [addEntity, enqueueSnackbar, entityId, entityName, removeEntity]
  );
  const handleToggle = (alert: Alert) => {
    setIsDialogOpen(true);
    setSelectedAlert(alert);
  };
  return (
    <>
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
                    data-qa="alert-table"
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
                          status={alert.entity_ids.includes(entityId)}
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
        alert={selectedAlert}
        entityName={entityName}
        handleCancel={handleCancel}
        handleConfirm={handleConfirm}
        isActive={selectedAlert?.entity_ids?.includes(entityId) ?? false}
        isLoading={isLoading}
        isOpen={isDialogOpen}
      />
    </>
  );
};

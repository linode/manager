import { Box } from '@linode/ui';
import { Grid, TableBody, TableHead } from '@mui/material';
import { useSnackbar } from 'notistack';
import React from 'react';

// eslint-disable-next-line no-restricted-imports
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

import type {
  Alert,
  APIError,
  CloudPulseAlertsPayload,
  EntityAlertUpdatePayload,
} from '@linode/api-v4';

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
   * Only use in edit flow
   */
  entityId?: string;

  /**
   * Name of the selected entity
   * Only use in edit flow
   */
  entityName?: string;

  /**
   * Error received from API
   */
  error?: APIError[] | null;

  /**
   * Called when an alert is toggled on or off.
   * Only use in create flow.
   * @param payload enabled alerts ids
   */
  onToggleAlert?: (payload: CloudPulseAlertsPayload) => void;

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

export interface AlertRowPropsOptions {
  /**
   * Enabled alerts payload
   */
  enabledAlerts: CloudPulseAlertsPayload;

  /**
   * Id of the entity
   * Only use in edit flow.
   */
  entityId?: string;

  /**
   * Callback function to handle alert toggle
   * Only use in create flow.
   */
  onToggleAlert?: (payload: CloudPulseAlertsPayload) => void;
}

export const AlertInformationActionTable = (
  props: AlertInformationActionTableProps
) => {
  const {
    alerts,
    columns,
    entityId,
    entityName,
    error,
    orderByColumn,
    onToggleAlert,
  } = props;

  const _error = error
    ? getAPIErrorOrDefault(error, 'Error while fetching the alerts')
    : undefined;
  const { enqueueSnackbar } = useSnackbar();
  const [selectedAlert, setSelectedAlert] = React.useState<Alert>({} as Alert);
  const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [enabledAlerts, setEnabledAlerts] =
    React.useState<CloudPulseAlertsPayload>({
      system: [],
      user: [],
    });

  const { mutateAsync: addEntity } = useAddEntityToAlert();

  const { mutateAsync: removeEntity } = useRemoveEntityFromAlert();

  const getAlertRowProps = (alert: Alert, options: AlertRowPropsOptions) => {
    const { entityId, enabledAlerts, onToggleAlert } = options;

    // Ensure that at least one of entityId or onToggleAlert is provided
    if (!(entityId || onToggleAlert)) {
      return null;
    }

    const isEditMode = !!entityId;

    const handleToggle = isEditMode
      ? handleToggleEditFlow
      : handleToggleCreateFlow;
    const status = isEditMode
      ? alert.entity_ids.includes(entityId)
      : enabledAlerts[alert.type].includes(alert.id);

    return { handleToggle, status };
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
  };
  const handleConfirm = React.useCallback(
    (alert: Alert, currentStatus: boolean) => {
      if (entityId === undefined) return;

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

  const handleToggleEditFlow = (alert: Alert) => {
    setIsDialogOpen(true);
    setSelectedAlert(alert);
  };

  const handleToggleCreateFlow = (alert: Alert) => {
    if (!onToggleAlert) return;

    setEnabledAlerts((prev: CloudPulseAlertsPayload) => {
      const newPayload = { ...prev };
      const index = newPayload[alert.type].indexOf(alert.id);
      // If the alert is already in the payload, remove it, otherwise add it
      if (index !== -1) {
        newPayload[alert.type].splice(index, 1);
      } else {
        newPayload[alert.type].push(alert.id);
      }

      onToggleAlert(newPayload);
      return newPayload;
    });
  };

  const isEnabled = selectedAlert.entity_ids?.includes(entityId ?? '') ?? false;

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
                      {paginatedAndOrderedAlerts?.map((alert) => {
                        const rowProps = getAlertRowProps(alert, {
                          enabledAlerts,
                          entityId,
                          onToggleAlert,
                        });

                        if (!rowProps) return null;

                        return (
                          <AlertInformationActionRow
                            alert={alert}
                            handleToggle={rowProps.handleToggle}
                            key={alert.id}
                            status={rowProps.status}
                          />
                        );
                      })}
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
        handleCancel={handleCancel}
        handleConfirm={handleConfirm}
        isEnabled={isEnabled}
        isLoading={isLoading}
        isOpen={isDialogOpen}
        message={`Are you sure you want to
              ${isEnabled ? 'disable' : 'enable'} the alert for ${entityName}?`}
      />
    </>
  );
};

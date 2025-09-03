import { type Alert, type APIError } from '@linode/api-v4';
import { Box, Button, TooltipIcon } from '@linode/ui';
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
import { ALERTS_BETA_PROMPT } from 'src/features/Linodes/constants';
import {
  servicePayloadTransformerMap,
  useAlertsMutation,
} from 'src/queries/cloudpulse/useAlertsMutation';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import { useContextualAlertsState } from '../../Utils/utils';
import { AlertConfirmationDialog } from '../AlertsLanding/AlertConfirmationDialog';
import { ALERT_SCOPE_TOOLTIP_CONTEXTUAL } from '../constants';
import { scrollToElement } from '../Utils/AlertResourceUtils';
import { arraysEqual } from '../Utils/utils';
import { AlertInformationActionRow } from './AlertInformationActionRow';

import type {
  CloudPulseAlertsPayload,
  CloudPulseServiceType,
} from '@linode/api-v4';
import type { PayloadTransformOverrides } from 'src/queries/cloudpulse/useAlertsMutation';

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
   * @param payload enabled alerts ids
   * @param hasUnsavedChanges boolean to check if there are unsaved changes
   */
  onToggleAlert?: (
    payload: CloudPulseAlertsPayload,
    hasUnsavedChanges?: boolean
  ) => void;

  /**
   * Column name by which columns will be ordered by default
   */
  orderByColumn: string;

  /**
   * Service type of the selected entity
   */
  serviceType: CloudPulseServiceType;

  /**
   * Flag to determine if confirmation dialog should be displayed
   */
  showConfirmationDialog?: boolean;
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
   * @param payload enabled alerts ids
   * @param hasUnsavedChanges boolean to check if there are unsaved changes
   */
  onToggleAlert?: (
    payload: CloudPulseAlertsPayload,
    hasUnsavedChanges?: boolean
  ) => void;
}

export const AlertInformationActionTable = (
  props: AlertInformationActionTableProps
) => {
  const {
    alerts,
    columns,
    entityId,
    error,
    orderByColumn,
    serviceType,
    onToggleAlert,
    showConfirmationDialog,
  } = props;

  const alertsTableRef = React.useRef<HTMLTableElement>(null);

  const _error = error
    ? getAPIErrorOrDefault(error, 'Error while fetching the alerts')
    : undefined;
  const { enqueueSnackbar } = useSnackbar();
  const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const isEditMode = !!entityId;
  const isCreateMode = !isEditMode;

  const {
    enabledAlerts,
    setEnabledAlerts,
    hasUnsavedChanges,
    initialState,
    resetToInitialState,
  } = useContextualAlertsState(alerts, entityId);

  // Mutation to update alerts as per service type
  const { mutateAsync: updateAlerts } = useAlertsMutation(
    serviceType,
    entityId ?? ''
  );

  React.useEffect(() => {
    // To send initial state of alerts through toggle handler function (For Create Flow)
    if (!isEditMode && onToggleAlert) {
      onToggleAlert(enabledAlerts);
    }

    return () => {
      // Cleanup on unmount (For Edit flow)
      if (isEditMode && onToggleAlert) {
        onToggleAlert({}, false);
      }
    };
  }, []);

  const handleCancel = () => {
    setIsDialogOpen(false);
  };

  const handleConfirm = React.useCallback(
    (alertIds: CloudPulseAlertsPayload) => {
      setIsLoading(true);
      const payload: CloudPulseAlertsPayload = {
        user: alertIds.user,
        system: alertIds.system,
      };
      updateAlerts(
        servicePayloadTransformerMap[
          serviceType as keyof PayloadTransformOverrides
        ](payload)
      )
        .then(() => {
          enqueueSnackbar('Your settings for alerts have been saved.', {
            variant: 'success',
          });
          // Reset the state to sync with the updated alerts from API
          resetToInitialState();
        })
        .catch(() => {
          enqueueSnackbar('Alerts changes were not saved, please try again.', {
            variant: 'error',
          });
        })
        .finally(() => {
          setIsLoading(false);
          setIsDialogOpen(false);
        });
    },
    [updateAlerts, enqueueSnackbar, resetToInitialState]
  );

  const handleToggleAlert = React.useCallback(
    (alert: Alert) => {
      setEnabledAlerts((prev: CloudPulseAlertsPayload) => {
        const newPayload = {
          system: [...(prev.system ?? [])],
          user: [...(prev.user ?? [])],
        };

        const alertIds = newPayload[alert.type];
        const isCurrentlyEnabled = alertIds.includes(alert.id);

        if (isCurrentlyEnabled) {
          // Remove alert - disable it
          const index = alertIds.indexOf(alert.id);
          alertIds.splice(index, 1);
        } else {
          // Add alert - enable it
          alertIds.push(alert.id);
        }

        const hasNewUnsavedChanges =
          !arraysEqual(newPayload.system, initialState.system) ||
          !arraysEqual(newPayload.user, initialState.user);

        // Call onToggleAlert in both create and edit flow
        if (onToggleAlert) {
          onToggleAlert(newPayload, hasNewUnsavedChanges);
        }

        return newPayload;
      });
    },
    [initialState, onToggleAlert, setEnabledAlerts]
  );

  const handleCustomPageChange = React.useCallback(
    (page: number, handlePageChange: (page: number) => void) => {
      handlePageChange(page);
      handlePageChange(page);
      requestAnimationFrame(() => {
        scrollToElement(alertsTableRef.current);
      });
    },
    []
  );

  return (
    <>
      <OrderBy data={alerts} order="asc" orderBy={orderByColumn}>
        {({ data: orderedData, handleOrderChange, order, orderBy }) => (
          <Paginate data={orderedData} shouldScroll={false}>
            {({
              count,
              data: paginatedAndOrderedAlerts,
              handlePageChange,
              handlePageSizeChange,
              page,
              pageSize,
            }) => (
              <>
                <Box>
                  <Grid>
                    <Table
                      colCount={columns.length + 1}
                      data-qa="alert-table"
                      data-testid="alert-table"
                      ref={alertsTableRef}
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
                                sx={{ position: 'relative' }}
                              >
                                {columnName}
                                {columnName === 'Scope' && (
                                  <TooltipIcon
                                    data-qa-tooltip="scope-tooltip"
                                    status="info"
                                    sxTooltipIcon={{
                                      position: 'absolute',
                                      right: '-30px',
                                      top: '50%',
                                      transform: 'translateY(-50%)',
                                    }}
                                    text={ALERT_SCOPE_TOOLTIP_CONTEXTUAL}
                                  />
                                )}
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
                          if (!(isEditMode || isCreateMode)) {
                            return null;
                          }

                          const status = enabledAlerts[alert.type]?.includes(
                            alert.id
                          );

                          return (
                            <AlertInformationActionRow
                              alert={alert}
                              handleToggle={handleToggleAlert}
                              key={alert.id}
                              status={status}
                            />
                          );
                        })}
                      </TableBody>
                    </Table>
                  </Grid>
                  <PaginationFooter
                    count={count}
                    eventCategory="Alert Definitions Table"
                    handlePageChange={(page: number) =>
                      handleCustomPageChange(page, handlePageChange)
                    }
                    handleSizeChange={handlePageSizeChange}
                    page={page}
                    pageSize={pageSize}
                  />
                </Box>
                {isEditMode && (
                  <Box>
                    <Button
                      buttonType="primary"
                      data-qa-buttons="true"
                      data-testid="save-alerts"
                      disabled={!hasUnsavedChanges || isLoading}
                      loading={isLoading}
                      onClick={() => {
                        if (showConfirmationDialog) {
                          setIsDialogOpen(true);
                        } else {
                          handleConfirm(enabledAlerts);
                        }
                      }}
                    >
                      Save
                    </Button>
                  </Box>
                )}
              </>
            )}
          </Paginate>
        )}
      </OrderBy>
      <AlertConfirmationDialog
        handleCancel={handleCancel}
        handleConfirm={() => handleConfirm(enabledAlerts)}
        isLoading={isLoading}
        isOpen={isDialogOpen}
        message={
          <>
            {ALERTS_BETA_PROMPT} <b>Legacy</b> settings will be disabled and
            replaced by (Beta) Alerts settings.
          </>
        }
        primaryButtonLabel="Confirm"
        title={ALERTS_BETA_PROMPT}
      />
    </>
  );
};

import { type Alert, type APIError } from '@linode/api-v4';
import { Box, Button, TooltipIcon } from '@linode/ui';
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
import { useServiceAlertsMutation } from 'src/queries/cloudpulse/alerts';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import { compareArrays } from '../../Utils/FilterBuilder';
import { AlertConfirmationDialog } from '../AlertsLanding/AlertConfirmationDialog';
import { ALERT_SCOPE_TOOLTIP_CONTEXTUAL } from '../constants';
import { AlertInformationActionRow } from './AlertInformationActionRow';

import type { CloudPulseAlertsPayload } from '@linode/api-v4';

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

  /**
   * Service type of the selected entity
   */
  serviceType: string;
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
    serviceType,
    onToggleAlert,
  } = props;

  const _error = error
    ? getAPIErrorOrDefault(error, 'Error while fetching the alerts')
    : undefined;
  const { enqueueSnackbar } = useSnackbar();
  const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [enabledAlerts, setEnabledAlerts] =
    React.useState<CloudPulseAlertsPayload>({
      system: [],
      user: [],
    });

  const isAccountOrRegionLevelAlert = (alert: Alert) =>
    alert.scope === 'region' || alert.scope === 'account';

  const isEditMode = !!entityId;

  // Store initial alert states for comparison using a ref
  const initialAlertStatesRef = React.useRef<CloudPulseAlertsPayload>({
    system: [],
    user: [],
  });

  const isAnyAlertStateChanged = React.useMemo(() => {
    const initial = initialAlertStatesRef.current;
    const current = enabledAlerts;

    if (!compareArrays(current.system ?? [], initial.system ?? [])) {
      return true;
    } else {
      return !compareArrays(current.user ?? [], initial.user ?? []);
    }
  }, [enabledAlerts]);

  // Initialize alert states based on their current status
  React.useEffect(() => {
    // Only run this effect for edit flow
    if (!entityId) {
      return;
    }

    const initialStates: CloudPulseAlertsPayload = {
      system: [],
      user: [],
    };
    alerts.forEach((alert) => {
      if (isAccountOrRegionLevelAlert(alert)) {
        initialStates[alert.type]?.push(alert.id);
      } else {
        if (alert.entity_ids.includes(entityId)) {
          initialStates[alert.type]?.push(alert.id);
        }
      }
    });
    setEnabledAlerts(initialStates);
    initialAlertStatesRef.current = {
      system: [...(initialStates.system ?? [])],
      user: [...(initialStates.user ?? [])],
    };
  }, [alerts, entityId]);

  const { mutateAsync: updateAlerts } = useServiceAlertsMutation(
    serviceType,
    entityId ?? ''
  );

  const getAlertRowProps = (alert: Alert, options: AlertRowPropsOptions) => {
    const { entityId, enabledAlerts, onToggleAlert } = options;

    // Ensure that at least one of entityId or onToggleAlert is provided
    if (!(entityId || onToggleAlert)) {
      return null;
    }

    const handleToggle = isEditMode
      ? handleToggleEditFlow
      : handleToggleCreateFlow;

    const status = enabledAlerts[alert.type]?.includes(alert.id);

    return { handleToggle, status };
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
  };

  const handleConfirm = React.useCallback(
    (alertIds: CloudPulseAlertsPayload) => {
      setIsLoading(true);
      updateAlerts({
        user: alertIds.user,
        system: alertIds.system,
      })
        .then(() => {
          enqueueSnackbar('Your settings for alerts have been saved.', {
            variant: 'success',
          });
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
    [updateAlerts, enqueueSnackbar]
  );

  const handleToggleEditFlow = (alert: Alert) => {
    setEnabledAlerts((prev: CloudPulseAlertsPayload) => {
      const newPayload: CloudPulseAlertsPayload = { ...prev };
      const index = newPayload[alert.type]?.indexOf(alert.id);

      // If the alert is already in the payload, remove it, otherwise add it
      if (index !== undefined && index !== -1) {
        newPayload[alert.type]?.splice(index, 1);
      } else {
        newPayload[alert.type]?.push(alert.id);
      }

      return newPayload;
    });
  };

  const handleToggleCreateFlow = (alert: Alert) => {
    if (!onToggleAlert) return;

    setEnabledAlerts((prev: CloudPulseAlertsPayload) => {
      const newPayload: CloudPulseAlertsPayload = { ...prev };
      const index = newPayload[alert.type]?.indexOf(alert.id);

      // If the alert is already in the payload, remove it, otherwise add it
      if (index !== undefined && index !== -1) {
        newPayload[alert.type]?.splice(index, 1);
      } else {
        newPayload[alert.type]?.push(alert.id);
      }

      onToggleAlert(newPayload);
      return newPayload;
    });
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
              <>
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
                          const rowProps = getAlertRowProps(alert, {
                            enabledAlerts,
                            entityId,
                            onToggleAlert,
                          });

                          if (!rowProps) return null;

                          // TODO: Remove this once we have a way to toggle ACCOUNT and REGION level alerts
                          if (!isEditMode && alert.scope !== 'entity') {
                            return null;
                          }

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
                {isEditMode && (
                  <Box>
                    <Button
                      buttonType="primary"
                      data-qa-buttons="true"
                      data-testid="save-alerts"
                      disabled={!isAnyAlertStateChanged}
                      onClick={() => {
                        window.scrollTo({
                          behavior: 'instant',
                          top: 0,
                        });
                        setIsDialogOpen(true);
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
          <span>
            Are you sure you want to save these settings for {entityName}? All
            legacy alert settings will be disabled and replaced by the new{' '}
            <b>Alerts(Beta)</b> settings.
          </span>
        }
        primaryButtonLabel="Save"
        title="Save Alerts?"
      />
    </>
  );
};

import { type Alert, type APIError } from '@linode/api-v4';
import { useLinodeQuery } from '@linode/queries';
import { Box, Button, CircleProgress, TooltipIcon } from '@linode/ui';
import { Grid, TableBody, TableHead } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
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
import { useAllEntitiesByAlertsQuery } from 'src/queries/cloudpulse/alerts';
import {
  invalidateAclpAlerts,
  servicePayloadTransformerMap,
  useAlertsMutation,
} from 'src/queries/cloudpulse/useAlertsMutation';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import { arraysEqual, useContextualAlertsState } from '../../Utils/utils';
import { AlertConfirmationDialog } from '../AlertsLanding/AlertConfirmationDialog';
import { ALERT_SCOPE_TOOLTIP_CONTEXTUAL } from '../constants';
import { scrollToElement } from '../Utils/AlertResourceUtils';
import { AlertInformationActionRow } from './AlertInformationActionRow';

import type {
  CloudPulseAlertsPayload,
  CloudPulseServiceType,
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
   * @param payload enabled alerts ids
   * @param hasUnsavedChanges boolean to check if there are unsaved changes.
   * - NOTE: Should not be used by service types in SERVICES_WITH_EXTERNAL_SAVE — this value
   * is derived from the query cache and can be stale in the window between save success and
   * the invalidated query resolving. Any toggle during that window would produce an incorrect
   * result. Those service owners should compute this themselves from the incoming payload,
   * and also invalidate the alerts query after save so toggle rows show the correct state
   * if the user navigates away and comes back.
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
   * @param hasUnsavedChanges boolean to check if there are unsaved changes.
   * - NOTE: Should not be used by service types in SERVICES_WITH_EXTERNAL_SAVE — this value
   * is derived from the query cache and can be stale in the window between save success and
   * the invalidated query resolving. Any toggle during that window would produce an incorrect
   * result. Those service owners should compute this themselves from the incoming payload,
   * and also invalidate the alerts query after save so toggle rows show the correct state
   * if the user navigates away and comes back.
   */
  onToggleAlert?: (
    payload: CloudPulseAlertsPayload,
    hasUnsavedChanges?: boolean
  ) => void;
}

/**
 * Service types whose parent component handles saving alerts externally.
 * The internal Save button is hidden for these service types.
 * Add a service type here to opt out of the built-in Save button.
 */
const SERVICES_WITH_EXTERNAL_SAVE: CloudPulseServiceType[] = ['linode'];

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

  // For linode: fetch the linode directly — it has alerts.system_alerts / user_alerts.
  // For other services: fetch entities per alert via the entities API.
  const isLinodeService = serviceType === 'linode';

  const {
    alertEntityMap: entitiesMap,
    isError: isEntitiesError,
    isLoading: isEntitiesLoading,
  } = useAllEntitiesByAlertsQuery(
    alerts,
    !isLinodeService ? entityId : undefined
  );

  const {
    data: linode,
    isError: isLinodeError,
    isLoading: isLinodeLoading,
  } = useLinodeQuery(Number(entityId), isLinodeService && !!entityId);

  // True while we are still waiting for the data source that backs alertEntityMap.
  // We gate the onToggleAlert notification on this so the parent never receives an
  // empty-array payload before entity data has resolved.
  const isEntityDataLoading = isLinodeService
    ? isLinodeLoading
    : isEntitiesLoading;

  const alertEntityMap = React.useMemo(() => {
    if (isLinodeService && linode && entityId) {
      const map = new Map<number, string[]>();
      [
        ...(linode.alerts?.system_alerts ?? []),
        ...(linode.alerts?.user_alerts ?? []),
      ].forEach((alertId) => map.set(alertId, [entityId]));
      return map;
    }
    return entitiesMap;
  }, [isLinodeService, linode, entityId, entitiesMap]);

  const isEntityError = isLinodeService ? isLinodeError : isEntitiesError;

  const _error =
    error || isEntityError
      ? getAPIErrorOrDefault(error ?? [], 'Error while fetching the alerts')
      : undefined;
  const { enqueueSnackbar } = useSnackbar();
  const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const isEditMode = !!entityId;
  const isCreateMode = !isEditMode;
  const payloadAlertType = (alert: Alert) =>
    alert.type === 'system' ? 'system_alerts' : 'user_alerts';

  const { enabledAlerts, setEnabledAlerts, hasUnsavedChanges, initialState } =
    useContextualAlertsState(alerts, entityId, alertEntityMap);

  const isAccountOrRegionAlert = (alert: Alert) =>
    alert.scope === 'region' || alert.scope === 'account';

  // Mutation to update alerts as per service type
  const updateAlerts = useAlertsMutation(serviceType, entityId ?? '');

  // Keep refs to always have the latest values available in the unmount cleanup
  // without those values being deps of the cleanup effect.
  const onToggleAlertRef = React.useRef(onToggleAlert);
  const isEditModeRef = React.useRef(isEditMode);
  React.useEffect(() => {
    onToggleAlertRef.current = onToggleAlert;
    isEditModeRef.current = isEditMode;
  });

  // Send current enabled state to the parent whenever it changes in edit mode,
  // but only after entity data has finished loading. This prevents sending an
  // empty-array payload before async data resolves — the parent receives exactly
  // one initial call with the real pre-checked state, then subsequent calls on
  // every user toggle.
  React.useEffect(() => {
    if (isEditMode && onToggleAlertRef.current && !isEntityDataLoading) {
      onToggleAlertRef.current(enabledAlerts, hasUnsavedChanges);
    }
  }, [enabledAlerts, hasUnsavedChanges, isEditMode, isEntityDataLoading]);

  // Cleanup only on actual unmount — uses refs so this effect never re-runs
  // mid-lifecycle, which would incorrectly send onToggleAlert({}, false) between
  // renders while the component is still mounted.
  React.useEffect(() => {
    return () => {
      if (isEditModeRef.current && onToggleAlertRef.current) {
        onToggleAlertRef.current({}, false);
      }
    };
  }, []);

  const handleCancel = () => {
    setIsDialogOpen(false);
  };

  const queryClient = useQueryClient();

  const handleConfirm = React.useCallback(
    (alertIds: CloudPulseAlertsPayload) => {
      setIsLoading(true);
      const payload: CloudPulseAlertsPayload = {
        user_alerts: alertIds.user_alerts,
        system_alerts: alertIds.system_alerts,
      };
      // call updateAlerts mutation with the transformed payload based on the service type
      updateAlerts(
        servicePayloadTransformerMap[serviceType]?.(payload) ?? payload
      )
        .then(() => {
          enqueueSnackbar('Your settings for alerts have been saved.', {
            variant: 'success',
          });
          onToggleAlertRef.current?.({}, false);
          invalidateAclpAlerts(
            queryClient,
            serviceType,
            entityId,
            payload,
            alertEntityMap
          );
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
    [
      updateAlerts,
      serviceType,
      enqueueSnackbar,
      queryClient,
      entityId,
      alertEntityMap,
    ]
  );

  const handleToggleAlert = React.useCallback(
    (alert: Alert) => {
      setEnabledAlerts((prev: CloudPulseAlertsPayload) => {
        const newPayload = {
          system_alerts: [...(prev.system_alerts ?? [])],
          user_alerts: [...(prev.user_alerts ?? [])],
        };

        const alertIds = newPayload[payloadAlertType(alert)];
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
          !arraysEqual(newPayload.system_alerts, initialState.system_alerts) ||
          !arraysEqual(newPayload.user_alerts, initialState.user_alerts);

        // Call onToggleAlert only in create mode - in edit mode, the useEffect handles it
        if (isCreateMode && onToggleAlertRef.current) {
          onToggleAlertRef.current(newPayload, hasNewUnsavedChanges);
        }

        return newPayload;
      });
    },
    [initialState, setEnabledAlerts, isCreateMode]
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

  if (isEntitiesLoading) {
    return <CircleProgress />;
  }
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
                          // If alert is account or region level, enable it by default and if it is entity type alert, check if it is enabled for that entity
                          const status =
                            isAccountOrRegionAlert(alert) ||
                            enabledAlerts[payloadAlertType(alert)]?.includes(
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
                    sx={{
                      // Prevents layout breaks and enables smooth collapse when table with this footer is used inside an Accordion.
                      // Without this, the PaginationFooter causes layout shifts during the collapse transition.
                      contain: 'layout',
                    }}
                  />
                </Box>
                {/* Show save button only in edit mode. Service types listed in
                    SERVICES_WITH_EXTERNAL_SAVE manage their own save externally
                    (e.g. linode handles it in the parent component). */}
                {isEditMode &&
                  !SERVICES_WITH_EXTERNAL_SAVE.includes(serviceType) && (
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

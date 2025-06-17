import { type Alert, type APIError } from '@linode/api-v4';
import { Box, Button } from '@linode/ui';
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
import { useServiceAlertsMutation } from 'src/queries/cloudpulse/alerts';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import { AlertContextualViewConfirmDialog } from './AlertContextualViewConfirmDialog';
import { AlertInformationActionRow } from './AlertInformationActionRow';

import type { ServiceAlertsUpdatePayload } from '@linode/api-v4';

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
  } = props;

  const _error = error
    ? getAPIErrorOrDefault(error, 'Error while fetching the alerts')
    : undefined;
  const { enqueueSnackbar } = useSnackbar();
  const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [alertStates, setAlertStates] = React.useState<Record<string, boolean>>(
    {}
  );

  const isAccountOrRegionLevelAlert = (alert: Alert) =>
    alert.scope === 'region' || alert.scope === 'account';

  // Store initial alert states for comparison using a ref
  const initialAlertStatesRef = React.useRef<Record<string, boolean>>({});

  // Initialize alert states based on their current status
  React.useEffect(() => {
    const initialStates: Record<string, boolean> = {};
    alerts.forEach((alert) => {
      if (isAccountOrRegionLevelAlert(alert)) {
        initialStates[alert.id] = true;
      } else {
        initialStates[alert.id] = alert.entity_ids.includes(entityId);
      }
    });
    setAlertStates(initialStates);
    initialAlertStatesRef.current = { ...initialStates };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(alerts), entityId]);

  const { mutateAsync: updateAlerts } = useServiceAlertsMutation(
    serviceType,
    entityId
  );

  const handleCancel = () => {
    setIsDialogOpen(false);
  };

  const handleConfirm = React.useCallback(
    (alertIds: ServiceAlertsUpdatePayload) => {
      setIsLoading(true);
      updateAlerts({
        user: alertIds.user,
        system: alertIds.system,
      })
        .then(() => {
          enqueueSnackbar(
            `The alert settings for ${entityName} saved successfully.`,
            { variant: 'success' }
          );
        })
        .catch(() => {
          enqueueSnackbar('Change in alert settings failed', {
            variant: 'error',
          });
        })
        .finally(() => {
          setIsLoading(false);
          setIsDialogOpen(false);
        });
    },
    [updateAlerts, enqueueSnackbar, entityName]
  );

  const handleToggle = (alert: Alert) => {
    // Toggle the state for this alert
    setAlertStates((prev) => ({
      ...prev,
      [alert.id]: !prev[alert.id],
    }));
  };

  // check if any alert state has changed from the initial state
  const isAnyAlertStateChanged = Object.keys(alertStates).some(
    (alertId) => alertStates[alertId] !== initialAlertStatesRef.current[alertId]
  );

  const enabledAlertIds = React.useMemo<ServiceAlertsUpdatePayload>(() => {
    return {
      user: alerts
        .filter(
          (alert) => alert.type === 'user' && alertStates[alert.id] === true
        )
        .map((alert) => alert.id),
      system: alerts
        .filter(
          (alert) => alert.type === 'system' && alertStates[alert.id] === true
        )
        .map((alert) => alert.id),
    };
  }, [alerts, alertStates]);

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
                          return (
                            <AlertInformationActionRow
                              alert={alert}
                              handleToggle={handleToggle}
                              isAlertActionRestricted={isAccountOrRegionLevelAlert(
                                alert
                              )}
                              key={alert.id}
                              status={
                                isAccountOrRegionLevelAlert(alert)
                                  ? true
                                  : alertStates[alert.id]
                              }
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
              </>
            )}
          </Paginate>
        )}
      </OrderBy>
      <AlertContextualViewConfirmDialog
        alertIds={enabledAlertIds}
        entityId={entityId}
        handleCancel={handleCancel}
        handleConfirm={handleConfirm}
        isLoading={isLoading}
        isOpen={isDialogOpen}
      />
    </>
  );
};

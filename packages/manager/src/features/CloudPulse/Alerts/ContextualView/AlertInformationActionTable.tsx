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

import { compareArrays } from '../../Utils/FilterBuilder';
import { AlertContextualViewConfirmDialog } from './AlertContextualViewConfirmDialog';
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
  const [enabledAlerts, setEnabledAlerts] =
    React.useState<CloudPulseAlertsPayload>({
      system: [],
      user: [],
    });

  // Store initial alert states for comparison using a ref
  const initialAlertStatesRef = React.useRef<CloudPulseAlertsPayload>({
    system: [],
    user: [],
  });

  // Initialize alert states based on their current status
  React.useEffect(() => {
    const initialStates: CloudPulseAlertsPayload = {
      system: [],
      user: [],
    };
    alerts.forEach((alert) => {
      if (alert.entity_ids.includes(entityId)) {
        initialStates[alert.type].push(alert.id);
      }
    });
    setEnabledAlerts(initialStates);
    initialAlertStatesRef.current = {
      system: [...initialStates.system],
      user: [...initialStates.user],
    };
  }, [alerts, entityId]);

  const { mutateAsync: updateAlerts } = useServiceAlertsMutation(
    serviceType,
    entityId
  );

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

  const handleToggle = (alert: Alert) => {
    setEnabledAlerts((prev: CloudPulseAlertsPayload) => {
      const newPayload: CloudPulseAlertsPayload = { ...prev };
      const index = newPayload[alert.type].indexOf(alert.id);

      // If the alert is already in the payload, remove it, otherwise add it
      if (index !== -1) {
        newPayload[alert.type].splice(index, 1);
      } else {
        newPayload[alert.type].push(alert.id);
      }

      return newPayload;
    });
  };

  const isAnyAlertStateChanged = React.useMemo(() => {
    const initial = initialAlertStatesRef.current;
    const current = enabledAlerts;

    if (!compareArrays(current.system, initial.system)) {
      return true;
    } else {
      return !compareArrays(current.user, initial.user);
    }
  }, [enabledAlerts]);

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
                              key={alert.id}
                              status={enabledAlerts[alert.type].includes(
                                alert.id
                              )}
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
        alertIds={enabledAlerts}
        entityName={entityName}
        handleCancel={handleCancel}
        handleConfirm={handleConfirm}
        isLoading={isLoading}
        isOpen={isDialogOpen}
      />
    </>
  );
};

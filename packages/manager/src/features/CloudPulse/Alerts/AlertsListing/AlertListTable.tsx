import { Box } from '@linode/ui';
import { groupByTags, sortGroups } from '@linode/utilities';
import { Grid2, TableBody, TableHead, TableRow } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { GroupByTagToggle } from 'src/components/GroupByTagToggle';
import OrderBy from 'src/components/OrderBy';
import Paginate from 'src/components/Paginate';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableCell } from 'src/components/TableCell';
import { TableContentWrapper } from 'src/components/TableContentWrapper/TableContentWrapper';
import { TableSortCell } from 'src/components/TableSortCell';
import { useEditAlertDefinition } from 'src/queries/cloudpulse/alerts';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import { AlertConfirmationDialog } from '../AlertsLanding/AlertConfirmationDialog';
import { UPDATE_ALERT_SUCCESS_MESSAGE } from '../constants';
import { AlertsTable } from './AlertsTable';
import { AlertListingTableLabelMap } from './constants';
import { GroupedAlertsTable } from './GroupedAlertsTable';

import type { Item } from '../constants';
import type { APIError, Alert, AlertServiceType } from '@linode/api-v4';
import type { Order } from '@linode/utilities';

export interface AlertsListTableProps {
  /**
   * The list of alerts to display
   */
  alerts: Alert[];
  /**
   * The current state of the alerts grouped by tag
   */
  alertsGroupedByTag?: boolean;
  /**
   * An error to display if there was an issue fetching the alerts
   */
  error?: APIError[];
  /**
   * A boolean indicating whether the alerts are loading
   */
  isLoading: boolean;
  /**
   * Callback to scroll to the button element on page change
   */
  scrollToElement: () => void;
  /**
   * The list of services to display in the table
   */
  services: Item<string, AlertServiceType>[];
  /**
   * The callback to toggle the alerts grouped by tag
   */
  toggleAlertsGroupedByTag?: () => boolean;
}
export const AlertsListTable = React.memo((props: AlertsListTableProps) => {
  const {
    alerts,
    alertsGroupedByTag,
    error,
    isLoading,
    scrollToElement,
    services,
    toggleAlertsGroupedByTag,
  } = props;

  const _error = error
    ? getAPIErrorOrDefault(error, 'Error in fetching the alerts.')
    : undefined;
  const history = useHistory();
  const { mutateAsync: editAlertDefinition } = useEditAlertDefinition(); // put call to update alert status

  const [selectedAlert, setSelectedAlert] = React.useState<Alert>({} as Alert);
  const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>(false);
  const [isUpdating, setIsUpdating] = React.useState<boolean>(false);

  const handleDetails = ({ id: _id, service_type: serviceType }: Alert) => {
    history.push(`${location.pathname}/detail/${serviceType}/${_id}`);
  };

  const handleEdit = ({ id, service_type: serviceType }: Alert) => {
    history.push(`${location.pathname}/edit/${serviceType}/${id}`);
  };

  const handleStatusChange = (alert: Alert) => {
    setSelectedAlert(alert);
    setIsDialogOpen(true);
  };

  const handleCancel = React.useCallback(() => {
    setIsDialogOpen(false);
  }, []);

  const handleConfirm = React.useCallback(
    (alert: Alert, currentStatus: boolean) => {
      const toggleStatus = currentStatus ? 'disabled' : 'enabled';
      const errorStatus = currentStatus ? 'Disabling' : 'Enabling';
      setIsUpdating(true);
      editAlertDefinition({
        alertId: alert.id,
        serviceType: alert.service_type,
        status: toggleStatus,
      })
        .then(() => {
          // Handle success
          enqueueSnackbar(UPDATE_ALERT_SUCCESS_MESSAGE, {
            variant: 'success',
          });
        })
        .catch((updateError: APIError[]) => {
          // Handle error
          const errorResponse = getAPIErrorOrDefault(
            updateError,
            `${errorStatus} alert failed`
          );
          enqueueSnackbar(errorResponse[0].reason, {
            variant: 'error',
          });
        })
        .finally(() => {
          setIsDialogOpen(false);
          setIsUpdating(false);
        });
    },
    [editAlertDefinition]
  );

  const isEnabled = selectedAlert.status !== 'disabled';

  const handleScrollAndPageChange = (
    page: number,
    handlePageChange: (p: number) => void
  ) => {
    handlePageChange(page);
    requestAnimationFrame(() => {
      scrollToElement();
    });
  };

  const handleScrollAndPageSizeChange = (
    pageSize: number,
    handlePageChange: (p: number) => void,
    handlePageSizeChange: (p: number) => void
  ) => {
    handlePageSizeChange(pageSize);
    handlePageChange(1);
    requestAnimationFrame(() => {
      scrollToElement();
    });
  };

  const handleSortClick = (
    orderBy: string,
    order: Order,
    handleOrderChange: (orderBy: string, order: Order) => void,
    handlePageChange: (page: number) => void
  ) => {
    if (order) {
      handleOrderChange(orderBy, order);
      handlePageChange(1);
    }
  };

  return (
    <>
      <OrderBy
        data={alerts}
        order="asc"
        orderBy="service_type"
        preferenceKey="alerts-landing"
      >
        {({ data: orderedData, handleOrderChange, order, orderBy }) => {
          return (
            <Paginate data={orderedData}>
              {({
                count,
                data: paginatedAndOrderedAlerts,
                handlePageChange,
                handlePageSizeChange,
                page,
                pageSize,
              }) => {
                const handleTableSort = (orderBy: string, order: Order) =>
                  handleSortClick(
                    orderBy,
                    order,
                    handleOrderChange,
                    handlePageChange
                  );

                return (
                  <>
                    <Grid2 sx={{ marginTop: 2 }}>
                      <Table
                        colCount={7}
                        data-qa="alert-table"
                        size="small"
                        tableClass={
                          alertsGroupedByTag ? 'MuiTable-groupByTag' : ''
                        }
                      >
                        <TableHead>
                          <TableRow>
                            {AlertListingTableLabelMap.map((value) => (
                              <TableSortCell
                                active={orderBy === value.label}
                                data-qa-header={value.label}
                                data-qa-sorting={value.label}
                                direction={order}
                                handleClick={handleTableSort}
                                key={value.label}
                                label={value.label}
                                noWrap
                              >
                                {value.colName}
                              </TableSortCell>
                            ))}
                            <TableCell sx={{ padding: '0 !important' }}>
                              <Box
                                sx={{
                                  alignItems: 'center',
                                  display: 'flex',
                                  gap: 3,
                                  justifyContent: 'flex-end',
                                  paddingRight: 1.5,
                                }}
                              >
                                <GroupByTagToggle
                                  isGroupedByTag={alertsGroupedByTag ?? false}
                                  toggleGroupByTag={
                                    toggleAlertsGroupedByTag ?? (() => false)
                                  }
                                />
                              </Box>
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableContentWrapper
                            error={_error}
                            length={paginatedAndOrderedAlerts.length}
                            loading={isLoading}
                            loadingProps={{ columns: 6 }}
                          />
                        </TableBody>
                        {alertsGroupedByTag ? (
                          <GroupedAlertsTable
                            groupedAlerts={sortGroups(groupByTags(orderedData))}
                            handleDetails={handleDetails}
                            handleEdit={handleEdit}
                            handleStatusChange={handleStatusChange}
                            services={services}
                          />
                        ) : (
                          <AlertsTable
                            alerts={paginatedAndOrderedAlerts}
                            handleDetails={handleDetails}
                            handleEdit={handleEdit}
                            handleStatusChange={handleStatusChange}
                            services={services}
                          />
                        )}
                      </Table>
                    </Grid2>
                    {!alertsGroupedByTag && (
                      <PaginationFooter
                        count={count}
                        eventCategory="Alert Definitions Table"
                        handlePageChange={(page) =>
                          handleScrollAndPageChange(page, handlePageChange)
                        }
                        handleSizeChange={(pageSize) => {
                          handleScrollAndPageSizeChange(
                            pageSize,
                            handlePageChange,
                            handlePageSizeChange
                          );
                        }}
                        page={page}
                        pageSize={pageSize}
                        sx={{ border: 0 }}
                      />
                    )}
                  </>
                );
              }}
            </Paginate>
          );
        }}
      </OrderBy>
      <AlertConfirmationDialog
        message={`Are you sure you want to ${
          isEnabled ? 'disable' : 'enable'
        } this alert definition?`}
        alert={selectedAlert}
        handleCancel={handleCancel}
        handleConfirm={handleConfirm}
        isEnabled={isEnabled}
        isLoading={isUpdating}
        isOpen={isDialogOpen}
      />
    </>
  );
});

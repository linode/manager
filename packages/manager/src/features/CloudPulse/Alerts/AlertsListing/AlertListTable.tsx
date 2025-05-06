import { Notice, Typography } from '@linode/ui';
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
import { TypeToConfirmDialog } from 'src/components/TypeToConfirmDialog/TypeToConfirmDialog';
import {
  useDeleteAlertDefinitionMutation,
  useEditAlertDefinition,
} from 'src/queries/cloudpulse/alerts';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import { AlertConfirmationDialog } from '../AlertsLanding/AlertConfirmationDialog';
import { UPDATE_ALERT_SUCCESS_MESSAGE } from '../constants';
import { AlertsTable } from './AlertsTable';
import { AlertListingTableLabelMap } from './constants';
import { GroupedAlertsTable } from './GroupedAlertsTable';

import type { Item } from '../constants';
import type {
  Alert,
  AlertServiceType,
  APIError,
  DeleteAlertPayload,
} from '@linode/api-v4';
import type { Order } from '@linode/utilities';

export interface AlertsListTableProps {
  /**
   * The list of alerts to display
   */
  alerts: Alert[];
  /**
   * An error to display if there was an issue fetching the alerts
   */
  error?: APIError[];
  /**
   * The current state of the alerts grouped by tag
   */
  isGroupedByTag?: boolean;
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
  toggleGroupByTag?: () => boolean;
}
export const AlertsListTable = React.memo((props: AlertsListTableProps) => {
  const {
    alerts,
    isGroupedByTag,
    error,
    isLoading,
    scrollToElement,
    services,
    toggleGroupByTag,
  } = props;

  const _error = error
    ? getAPIErrorOrDefault(error, 'Error in fetching the alerts.')
    : undefined;
  const history = useHistory();
  const { mutateAsync: editAlertDefinition } = useEditAlertDefinition(); // put call to update alert status
  const { mutateAsync: deleteAlertDefinition } =
    useDeleteAlertDefinitionMutation();

  const [selectedAlert, setSelectedAlert] = React.useState<Alert>({} as Alert);
  const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>(false);
  const [isUpdating, setIsUpdating] = React.useState<boolean>(false);
  const [deleteState, setDeleteState] = React.useState({
    isDialogOpen: false,
    isDeleting: false,
  });

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

  const handleDelete = React.useCallback((alert: Alert) => {
    setSelectedAlert(alert);
    setDeleteState((prev) => ({ ...prev, isDialogOpen: true }));
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
        type: alert.type,
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

  const handleDeleteConfirm = React.useCallback(
    (alert: Alert) => {
      const payload: DeleteAlertPayload = {
        serviceType: alert.service_type,
        alertId: alert.id,
      };
      setDeleteState((prev) => ({ ...prev, isDeleting: true }));

      deleteAlertDefinition(payload)
        .then(() => {
          enqueueSnackbar('Alert deleted', { variant: 'success' });
        })
        .catch((deleteError: APIError[]) => {
          const errorResponse = getAPIErrorOrDefault(
            deleteError,
            'Failed to delete alert. Please try again.'
          );
          enqueueSnackbar(errorResponse[0].reason, { variant: 'error' });
        })
        .finally(() => {
          setDeleteState({ isDialogOpen: false, isDeleting: false });
        });
    },
    [deleteAlertDefinition]
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
    handleOrderChange: (orderBy: string, order?: Order) => void,
    handlePageChange: (page: number) => void,
    order?: Order
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
                const handleTableSort = (orderBy: string, order?: Order) =>
                  handleSortClick(
                    orderBy,
                    handleOrderChange,
                    handlePageChange,
                    order
                  );

                return (
                  <>
                    <Grid2 sx={{ marginTop: 2 }}>
                      <Table
                        colCount={7}
                        data-qa="alert-table"
                        size="small"
                        tableClass={isGroupedByTag ? 'MuiTable-groupByTag' : ''}
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
                            <TableCell
                              sx={{
                                textAlign: 'right',
                              }}
                            >
                              <GroupByTagToggle
                                isGroupedByTag={isGroupedByTag ?? false}
                                toggleGroupByTag={
                                  toggleGroupByTag ?? (() => false)
                                }
                              />
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
                        {isGroupedByTag ? (
                          <GroupedAlertsTable
                            groupedAlerts={sortGroups(groupByTags(orderedData))}
                            handleDelete={handleDelete}
                            handleDetails={handleDetails}
                            handleEdit={handleEdit}
                            handleStatusChange={handleStatusChange}
                            services={services}
                          />
                        ) : (
                          <AlertsTable
                            alerts={paginatedAndOrderedAlerts}
                            handleDelete={handleDelete}
                            handleDetails={handleDetails}
                            handleEdit={handleEdit}
                            handleStatusChange={handleStatusChange}
                            services={services}
                          />
                        )}
                      </Table>
                    </Grid2>
                    {!isGroupedByTag && (
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
        alert={selectedAlert}
        handleCancel={handleCancel}
        handleConfirm={handleConfirm}
        isEnabled={isEnabled}
        isLoading={isUpdating}
        isOpen={isDialogOpen}
        message={`Are you sure you want to ${
          isEnabled ? 'disable' : 'enable'
        } this alert definition?`}
      />
      <TypeToConfirmDialog
        entity={{
          action: 'deletion',
          name: selectedAlert.label,
          primaryBtnText: 'Delete',
          type: 'Alert',
        }}
        expand
        label="Alert Label"
        loading={deleteState.isDeleting}
        onClick={() => handleDeleteConfirm(selectedAlert)}
        onClose={() =>
          setDeleteState((prev) => ({ ...prev, isDialogOpen: false }))
        }
        open={deleteState.isDialogOpen}
        title={`Delete ${selectedAlert.label ?? ''}? `}
      >
        <Notice variant="warning">
          <Typography>
            <strong>Warning:</strong> Deleting this Alert is permanent and
            can&lsquo;t be undone.
          </Typography>
        </Notice>
      </TypeToConfirmDialog>
    </>
  );
});

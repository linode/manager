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

import { OPTIMISTIC_SUCCESS_MESSAGE } from '../constants';
import { AlertListingTableLabelMap } from './constants';
import { GroupedAlertsTable } from './GroupedAlerts';
import { AlertsTable } from './UngroupedAlerts';

import type { Item } from '../constants';
import type { APIError, Alert, AlertServiceType } from '@linode/api-v4';

export interface AlertsListTableProps {
  /**
   * The list of alerts to display
   */
  alerts: Alert[];
  /**
   * The current state of the alerts grouped by tag
   */
  alertsGroupedByTag: boolean;
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
  toggleAlertsGroupedByTag: () => boolean;
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

  const handleDetails = ({ id: _id, service_type: serviceType }: Alert) => {
    history.push(`${location.pathname}/detail/${serviceType}/${_id}`);
  };

  const handleEdit = ({ id, service_type: serviceType }: Alert) => {
    history.push(`${location.pathname}/edit/${serviceType}/${id}`);
  };

  const handleStatusChange = React.useCallback(
    (alert: Alert) => {
      const toggleStatus = alert.status === 'enabled' ? 'disabled' : 'enabled';
      const errorStatus =
        toggleStatus === 'disabled' ? 'Disabling' : 'Enabling';
      editAlertDefinition({
        alertId: alert.id,
        serviceType: alert.service_type,
        status: toggleStatus,
      })
        .then(() => {
          // Handle success
          enqueueSnackbar(OPTIMISTIC_SUCCESS_MESSAGE, {
            variant: 'info',
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
        });
    },
    [editAlertDefinition]
  );

  return (
    <OrderBy
      data={alerts}
      order="asc"
      orderBy="service_type"
      preferenceKey="alerts-landing"
    >
      {({ data: orderedData, handleOrderChange, order, orderBy }) => {
        return (
          <Paginate data={alerts}>
            {({
              count,
              data: paginatedAndOrderedAlerts,
              handlePageChange,
              handlePageSizeChange,
              page,
              pageSize,
            }) => (
              <>
                <Grid2 sx={{ marginTop: 2 }}>
                  <Table
                    colCount={7}
                    data-qa="alert-table"
                    size="small"
                    tableClass={alertsGroupedByTag ? 'MuiTable-groupByTag' : ''}
                  >
                    <TableHead>
                      <TableRow>
                        {AlertListingTableLabelMap.map((value) => (
                          <TableSortCell
                            handleClick={(orderBy, order) => {
                              if (order) {
                                handleOrderChange(orderBy, order);
                                handlePageChange(1);
                              }
                            }}
                            active={orderBy === value.label}
                            data-qa-header={value.label}
                            data-qa-sorting={value.label}
                            direction={order}
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
                              isGroupedByTag={alertsGroupedByTag}
                              toggleGroupByTag={toggleAlertsGroupedByTag}
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
                    </TableBody>
                  </Table>
                </Grid2>
                {!alertsGroupedByTag && (
                  <PaginationFooter
                    handlePageChange={(page: number) => {
                      handlePageChange(page);
                      requestAnimationFrame(() => {
                        scrollToElement();
                      });
                    }}
                    handleSizeChange={(pageSize) => {
                      handlePageSizeChange(pageSize);
                      handlePageChange(1);
                      requestAnimationFrame(() => {
                        scrollToElement();
                      });
                    }}
                    count={count}
                    eventCategory="Alert Definitions Table"
                    page={page}
                    pageSize={pageSize}
                    sx={{ border: 0 }}
                  />
                )}
              </>
            )}
          </Paginate>
        );
      }}
    </OrderBy>
  );
});

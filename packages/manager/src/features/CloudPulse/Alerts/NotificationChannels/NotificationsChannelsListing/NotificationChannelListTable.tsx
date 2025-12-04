import { TooltipIcon } from '@linode/ui';
import { GridLegacy, TableBody, TableHead } from '@mui/material';
import React from 'react';

import Paginate from 'src/components/Paginate';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableCell } from 'src/components/TableCell';
import { TableContentWrapper } from 'src/components/TableContentWrapper/TableContentWrapper';
import { TableRow } from 'src/components/TableRow';
import { TableSortCell } from 'src/components/TableSortCell';
import { useOrderV2 } from 'src/hooks/useOrderV2';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import {
  ChannelAlertsTooltipText,
  ChannelListingTableLabelMap,
} from './constants';
import { NotificationChannelTableRow } from './NotificationChannelTableRow';

import type { APIError, NotificationChannel } from '@linode/api-v4';
import type { Order } from '@linode/utilities';

export interface NotificationChannelListTableProps {
  /**
   * The error returned from the API call to fetch notification channels
   */
  error?: APIError[];
  /**
   * Indicates if the data is loading
   */
  isLoading: boolean;
  /**
   * The list of notification channels to display in the table
   */
  notificationChannels: NotificationChannel[];
  /**
   * Function to scroll to a specific element on the page
   * @returns void
   */
  scrollToElement: () => void;
}

export const NotificationChannelListTable = React.memo(
  (props: NotificationChannelListTableProps) => {
    const { error, isLoading, notificationChannels, scrollToElement } = props;

    const _error = error
      ? getAPIErrorOrDefault(
          error,
          'Error in fetching the notification channels'
        )
      : undefined;

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

    const { order, orderBy, handleOrderChange, sortedData } = useOrderV2({
      data: notificationChannels,
      initialRoute: {
        defaultOrder: {
          order: 'asc',
          orderBy: 'label',
        },
        from: '/alerts/notification-channels',
      },
      preferenceKey: 'alerts-notification-channels',
    });

    return (
      <Paginate data={sortedData ?? []}>
        {({
          count,
          data: paginatedAndOrderedNotificationChannels,
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
              <GridLegacy sx={{ marginTop: 2 }}>
                <Table
                  colCount={7}
                  data-qa="notification-channels-table"
                  size="small"
                >
                  <TableHead>
                    <TableRow>
                      {ChannelListingTableLabelMap.map((value) => (
                        <TableSortCell
                          active={orderBy === value.label}
                          direction={order}
                          handleClick={handleTableSort}
                          key={value.label}
                          label={value.label}
                          noWrap
                        >
                          {value.colName}
                          {value.colName === 'Alerts' && (
                            <TooltipIcon
                              status="info"
                              sxTooltipIcon={{ margin: 0, padding: 0 }}
                              text={ChannelAlertsTooltipText}
                            />
                          )}
                        </TableSortCell>
                      ))}
                      <TableCell />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableContentWrapper
                      error={_error}
                      length={paginatedAndOrderedNotificationChannels.length}
                      loading={isLoading}
                      loadingProps={{ columns: 7 }}
                    />
                  </TableBody>
                  <TableBody>
                    {paginatedAndOrderedNotificationChannels.map(
                      (channel: NotificationChannel) => (
                        <NotificationChannelTableRow
                          key={channel.id}
                          notificationChannel={channel}
                        />
                      )
                    )}
                  </TableBody>
                </Table>
              </GridLegacy>
              <PaginationFooter
                count={count}
                eventCategory="Notification Channels Table"
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
            </>
          );
        }}
      </Paginate>
    );
  }
);

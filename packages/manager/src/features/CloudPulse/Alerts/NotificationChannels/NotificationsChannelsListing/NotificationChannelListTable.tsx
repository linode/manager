import { Notice, TooltipIcon, Typography } from '@linode/ui';
import { GridLegacy, TableBody, TableHead } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';
import { useSnackbar } from 'notistack';
import React from 'react';

import Paginate from 'src/components/Paginate';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableCell } from 'src/components/TableCell';
import { TableContentWrapper } from 'src/components/TableContentWrapper/TableContentWrapper';
import { TableRow } from 'src/components/TableRow';
import { TableSortCell } from 'src/components/TableSortCell';
import { TypeToConfirmDialog } from 'src/components/TypeToConfirmDialog/TypeToConfirmDialog';
import { useOrderV2 } from 'src/hooks/useOrderV2';
import { useDeleteNotificationChannel } from 'src/queries/cloudpulse/alerts';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import {
  DELETE_CHANNEL_FAILED_MESSAGE,
  DELETE_CHANNEL_SUCCESS_MESSAGE,
} from '../../constants';
import {
  ChannelAlertsTooltipText,
  ChannelListingTableLabelMap,
} from './constants';
import { NotificationChannelTableRow } from './NotificationChannelTableRow';

import type {
  APIError,
  DeleteChannelPayload,
  NotificationChannel,
} from '@linode/api-v4';
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
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const { mutateAsync: deleteChannel, isPending: isDeleting } =
      useDeleteNotificationChannel();

    const [selectedChannel, setSelectedChannel] =
      React.useState<NotificationChannel | null>(null);
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);

    const handleDetails = ({ id }: NotificationChannel) => {
      navigate({
        to: '/alerts/notification-channels/detail/$channelId',
        params: { channelId: String(id) },
      });
    };

    const handleEdit = ({ id }: NotificationChannel) => {
      navigate({
        to: '/alerts/notification-channels/edit/$channelId',
        params: { channelId: id },
      });
    };

    const handleDelete = React.useCallback((channel: NotificationChannel) => {
      setSelectedChannel(channel);
      setIsDialogOpen(true);
    }, []);

    const handleDeleteConfirm = React.useCallback(() => {
      if (!selectedChannel) {
        return;
      }

      const payload: DeleteChannelPayload = {
        channelId: selectedChannel.id,
      };

      deleteChannel(payload)
        .then(() => {
          enqueueSnackbar(DELETE_CHANNEL_SUCCESS_MESSAGE, {
            variant: 'success',
          });
        })
        .catch((deleteError: APIError[]) => {
          const errorResponse = getAPIErrorOrDefault(
            deleteError,
            DELETE_CHANNEL_FAILED_MESSAGE
          );
          enqueueSnackbar(errorResponse[0].reason, { variant: 'error' });
        })
        .finally(() => {
          setIsDialogOpen(false);
        });
    }, [deleteChannel, enqueueSnackbar, selectedChannel]);

    const _error = error
      ? getAPIErrorOrDefault(
          error,
          'Error in fetching the notification channels.'
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
                          data-qa-header={value.colName}
                          data-qa-sorting={value.colName}
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
                          handlers={{
                            handleDetails: () => handleDetails(channel),
                            handleEdit: () => handleEdit(channel),
                            handleDelete: () => handleDelete(channel),
                          }}
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
              <TypeToConfirmDialog
                entity={{
                  action: 'deletion',
                  name: selectedChannel?.label ?? '',
                  primaryBtnText: 'Delete',
                  type: 'Notification Channel',
                }}
                expand
                label="Notification Channel Label"
                loading={isDeleting}
                onClick={handleDeleteConfirm}
                onClose={() => {
                  setIsDialogOpen(false);
                  setSelectedChannel(null);
                }}
                open={isDialogOpen}
                title={`Delete ${selectedChannel?.label ?? ''}?`}
              >
                <Notice variant="warning">
                  <Typography>
                    <strong>Warning:</strong> Deleting your Notification Channel
                    will result in permanent data loss.
                  </Typography>
                </Notice>
              </TypeToConfirmDialog>
            </>
          );
        }}
      </Paginate>
    );
  }
);

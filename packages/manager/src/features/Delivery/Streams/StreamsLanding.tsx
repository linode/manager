import { streamStatus } from '@linode/api-v4';
import {
  useDeleteStreamMutation,
  useStreamsQuery,
  useUpdateStreamMutation,
} from '@linode/queries';
import { CircleProgress, ErrorState, Hidden } from '@linode/ui';
import { TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import Table from '@mui/material/Table';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { enqueueSnackbar } from 'notistack';
import * as React from 'react';

import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableSortCell } from 'src/components/TableSortCell';
import { DeliveryTabHeader } from 'src/features/Delivery/Shared/DeliveryTabHeader/DeliveryTabHeader';
import { streamStatusOptions } from 'src/features/Delivery/Shared/types';
import {
  STREAMS_TABLE_DEFAULT_ORDER,
  STREAMS_TABLE_DEFAULT_ORDER_BY,
  STREAMS_TABLE_PREFERENCE_KEY,
} from 'src/features/Delivery/Streams/constants';
import { StreamsLandingEmptyState } from 'src/features/Delivery/Streams/StreamsLandingEmptyState';
import { StreamTableRow } from 'src/features/Delivery/Streams/StreamTableRow';
import { useOrderV2 } from 'src/hooks/useOrderV2';
import { usePaginationV2 } from 'src/hooks/usePaginationV2';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import type { Handlers as StreamHandlers } from './StreamActionMenu';
import type { Stream } from '@linode/api-v4';

export const StreamsLanding = () => {
  const navigate = useNavigate();
  const streamsUrl = '/logs/delivery/streams';
  const search = useSearch({
    from: '/logs/delivery/streams',
    shouldThrow: false,
  });
  const pagination = usePaginationV2({
    currentRoute: streamsUrl,
    preferenceKey: STREAMS_TABLE_PREFERENCE_KEY,
  });

  const { handleOrderChange, order, orderBy } = useOrderV2({
    initialRoute: {
      defaultOrder: {
        order: STREAMS_TABLE_DEFAULT_ORDER,
        orderBy: STREAMS_TABLE_DEFAULT_ORDER_BY,
      },
      from: streamsUrl,
    },
    preferenceKey: `streams-order`,
  });

  const { mutateAsync: updateStream } = useUpdateStreamMutation();
  const { mutateAsync: deleteStream } = useDeleteStreamMutation();

  const filter = {
    ['+order']: order,
    ['+order_by']: orderBy,
    ...(search?.label !== undefined && {
      label: { '+contains': search?.label },
    }),
    ...(search?.status !== undefined && {
      status: { '+contains': search?.status },
    }),
  };

  const {
    data: streams,
    isLoading,
    isFetching,
    error,
  } = useStreamsQuery(
    {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
    filter
  );

  const onSearch = (label: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        page: undefined,
        label: label ? label : undefined,
      }),
      to: streamsUrl,
    });
  };

  const onSelect = (status: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        page: undefined,
        status: status ? status : undefined,
      }),
      to: streamsUrl,
    });
  };

  const navigateToCreate = () => {
    navigate({ to: '/logs/delivery/streams/create' });
  };

  if (error) {
    return (
      <ErrorState errorText="There was an error retrieving your streams. Please reload and try again." />
    );
  }

  if (streams?.results === 0 && !search?.status && !search?.label) {
    return <StreamsLandingEmptyState navigateToCreate={navigateToCreate} />;
  }

  const handleEdit = ({ id }: Stream) => {
    navigate({ to: `/logs/delivery/streams/${id}/edit` });
  };

  const handleDelete = ({ id, label }: Stream) => {
    deleteStream({
      id,
    })
      .then(() => {
        return enqueueSnackbar(`Stream  ${label} deleted successfully`, {
          variant: 'success',
        });
      })
      .catch((error) => {
        return enqueueSnackbar(
          getAPIErrorOrDefault(
            error,
            `There was an issue deleting your stream`
          )[0].reason,
          {
            variant: 'error',
          }
        );
      });
  };

  const handleDisableOrEnable = ({
    id,
    destinations,
    details,
    label,
    type,
    status,
  }: Stream) => {
    updateStream({
      id,
      destinations: destinations.map(({ id: destinationId }) => destinationId),
      details,
      label,
      type,
      status:
        status === streamStatus.Active
          ? streamStatus.Inactive
          : streamStatus.Active,
    })
      .then(() => {
        return enqueueSnackbar(
          `Stream  ${label} ${status === streamStatus.Active ? 'disabled' : 'enabled'}`,
          {
            variant: 'success',
          }
        );
      })
      .catch((error) => {
        return enqueueSnackbar(
          getAPIErrorOrDefault(
            error,
            `There was an issue ${status === streamStatus.Active ? 'disabling' : 'enabling'} your stream`
          )[0].reason,
          {
            variant: 'error',
          }
        );
      });
  };

  const handlers: StreamHandlers = {
    onDisableOrEnable: handleDisableOrEnable,
    onEdit: handleEdit,
    onDelete: handleDelete,
  };

  return (
    <>
      <DeliveryTabHeader
        entity="Stream"
        isSearching={isFetching}
        loading={isLoading}
        onButtonClick={navigateToCreate}
        onSearch={onSearch}
        onSelect={onSelect}
        searchValue={search?.label ?? ''}
        selectList={streamStatusOptions}
        selectValue={search?.status}
      />

      {isLoading ? (
        <CircleProgress />
      ) : (
        <>
          <Table>
            <TableHead>
              <TableRow>
                <TableSortCell
                  active={orderBy === 'label'}
                  direction={order}
                  handleClick={handleOrderChange}
                  label="label"
                  sx={{ width: '30%' }}
                >
                  Name
                </TableSortCell>
                <TableCell>Stream Type</TableCell>
                <TableSortCell
                  active={orderBy === 'status'}
                  direction={order}
                  handleClick={handleOrderChange}
                  label="status"
                >
                  Status
                </TableSortCell>
                <TableSortCell
                  active={orderBy === 'id'}
                  direction={order}
                  handleClick={handleOrderChange}
                  label="id"
                >
                  ID
                </TableSortCell>
                <Hidden smDown>
                  <TableCell>Destination Type</TableCell>
                </Hidden>
                <Hidden lgDown>
                  <TableSortCell
                    active={orderBy === 'created'}
                    direction={order}
                    handleClick={handleOrderChange}
                    label="created"
                  >
                    Creation Time
                  </TableSortCell>
                </Hidden>
                <TableCell sx={{ width: '5%' }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {streams?.data.map((stream) => (
                <StreamTableRow key={stream.id} stream={stream} {...handlers} />
              ))}
              {streams?.results === 0 && <TableRowEmpty colSpan={6} />}
            </TableBody>
          </Table>
          <PaginationFooter
            count={streams?.results || 0}
            eventCategory="Streams Table"
            handlePageChange={pagination.handlePageChange}
            handleSizeChange={pagination.handlePageSizeChange}
            page={pagination.page}
            pageSize={pagination.pageSize}
          />
        </>
      )}
    </>
  );
};

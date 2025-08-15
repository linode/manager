import { streamStatus } from '@linode/api-v4';
import {
  useDeleteStreamMutation,
  useStreamsQuery,
  useUpdateStreamMutation,
} from '@linode/queries';
import { CircleProgress, ErrorState, Hidden } from '@linode/ui';
import { TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import Table from '@mui/material/Table';
import { useNavigate } from '@tanstack/react-router';
import { enqueueSnackbar } from 'notistack';
import * as React from 'react';

import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { TableSortCell } from 'src/components/TableSortCell';
import { DataStreamTabHeader } from 'src/features/DataStream/Shared/DataStreamTabHeader/DataStreamTabHeader';
import {
  STREAMS_TABLE_DEFAULT_ORDER,
  STREAMS_TABLE_DEFAULT_ORDER_BY,
  STREAMS_TABLE_PREFERENCE_KEY,
} from 'src/features/DataStream/Streams/constants';
import { StreamsLandingEmptyState } from 'src/features/DataStream/Streams/StreamsLandingEmptyState';
import { StreamTableRow } from 'src/features/DataStream/Streams/StreamTableRow';
import { useOrderV2 } from 'src/hooks/useOrderV2';
import { usePaginationV2 } from 'src/hooks/usePaginationV2';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import type { Handlers as StreamHandlers } from './StreamActionMenu';
import type { Stream } from '@linode/api-v4';

export const StreamsLanding = () => {
  const navigate = useNavigate();

  const { mutateAsync: updateStream } = useUpdateStreamMutation();
  const { mutateAsync: deleteStream } = useDeleteStreamMutation();

  const pagination = usePaginationV2({
    currentRoute: '/datastream/streams',
    preferenceKey: STREAMS_TABLE_PREFERENCE_KEY,
  });

  const { handleOrderChange, order, orderBy } = useOrderV2({
    initialRoute: {
      defaultOrder: {
        order: STREAMS_TABLE_DEFAULT_ORDER,
        orderBy: STREAMS_TABLE_DEFAULT_ORDER_BY,
      },
      from: '/datastream/streams',
    },
    preferenceKey: `streams-order`,
  });

  const filter = {
    ['+order']: order,
    ['+order_by']: orderBy,
  };

  const {
    data: streams,
    isLoading,
    error,
  } = useStreamsQuery(
    {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
    filter
  );

  const navigateToCreate = () => {
    navigate({ to: '/datastream/streams/create' });
  };

  if (isLoading) {
    return <CircleProgress />;
  }

  if (error) {
    return (
      <ErrorState errorText="There was an error retrieving your streams. Please reload and try again." />
    );
  }

  if (!streams?.data.length) {
    return <StreamsLandingEmptyState navigateToCreate={navigateToCreate} />;
  }

  const handleEdit = ({ id }: Stream) => {
    navigate({ to: `/datastream/streams/${id}/edit` });
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
      <DataStreamTabHeader
        entity="Stream"
        loading={isLoading}
        onButtonClick={navigateToCreate}
      />
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
  );
};

import { useStreamsQuery } from '@linode/queries';
import { CircleProgress, ErrorState, Hidden } from '@linode/ui';
import { TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import Table from '@mui/material/Table';
import { useNavigate, useSearch } from '@tanstack/react-router';
import * as React from 'react';

import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { TableSortCell } from 'src/components/TableSortCell';
import { DataStreamTabHeader } from 'src/features/DataStream/Shared/DataStreamTabHeader/DataStreamTabHeader';
import { streamStatusOptions } from 'src/features/DataStream/Shared/types';
import {
  STREAMS_TABLE_DEFAULT_ORDER,
  STREAMS_TABLE_DEFAULT_ORDER_BY,
  STREAMS_TABLE_PREFERENCE_KEY,
} from 'src/features/DataStream/Streams/constants';
import { StreamsLandingEmptyState } from 'src/features/DataStream/Streams/StreamsLandingEmptyState';
import { StreamTableRow } from 'src/features/DataStream/Streams/StreamTableRow';
import { useOrderV2 } from 'src/hooks/useOrderV2';
import { usePaginationV2 } from 'src/hooks/usePaginationV2';

export const StreamsLanding = () => {
  const navigate = useNavigate();
  const streamsUrl = '/datastream/streams';
  const search = useSearch({
    from: '/datastream/streams',
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

  return (
    <>
      <DataStreamTabHeader
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
      <Table>
        <TableHead>
          <TableRow>
            <TableSortCell
              active={orderBy === 'label'}
              direction={order}
              handleClick={handleOrderChange}
              label="label"
            >
              Name
            </TableSortCell>
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
            <TableCell>Destination Type</TableCell>
            <Hidden smDown>
              <TableSortCell
                active={orderBy === 'created'}
                direction={order}
                handleClick={handleOrderChange}
                label="created"
              >
                Creation Time
              </TableSortCell>
            </Hidden>
          </TableRow>
        </TableHead>
        <TableBody>
          {streams?.data.map((stream) => (
            <StreamTableRow key={stream.id} stream={stream} />
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

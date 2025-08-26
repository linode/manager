import { useDestinationsQuery } from '@linode/queries';
import { CircleProgress, ErrorState, Hidden } from '@linode/ui';
import { TableBody, TableHead, TableRow } from '@mui/material';
import Table from '@mui/material/Table';
import { useNavigate, useSearch } from '@tanstack/react-router';
import * as React from 'react';

import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { TableSortCell } from 'src/components/TableSortCell';
import {
  DESTINATIONS_TABLE_DEFAULT_ORDER,
  DESTINATIONS_TABLE_DEFAULT_ORDER_BY,
  DESTINATIONS_TABLE_PREFERENCE_KEY,
} from 'src/features/DataStream/Destinations/constants';
import { DestinationsLandingEmptyState } from 'src/features/DataStream/Destinations/DestinationsLandingEmptyState';
import { DestinationTableRow } from 'src/features/DataStream/Destinations/DestinationTableRow';
import { DataStreamTabHeader } from 'src/features/DataStream/Shared/DataStreamTabHeader/DataStreamTabHeader';
import { useOrderV2 } from 'src/hooks/useOrderV2';
import { usePaginationV2 } from 'src/hooks/usePaginationV2';

export const DestinationsLanding = () => {
  const navigate = useNavigate();
  const destinationsUrl = '/datastream/destinations';
  const search = useSearch({
    from: destinationsUrl,
    shouldThrow: false,
  });
  const pagination = usePaginationV2({
    currentRoute: destinationsUrl,
    preferenceKey: DESTINATIONS_TABLE_PREFERENCE_KEY,
  });

  const { handleOrderChange, order, orderBy } = useOrderV2({
    initialRoute: {
      defaultOrder: {
        order: DESTINATIONS_TABLE_DEFAULT_ORDER,
        orderBy: DESTINATIONS_TABLE_DEFAULT_ORDER_BY,
      },
      from: destinationsUrl,
    },
    preferenceKey: `destinations-order`,
  });

  const filter = {
    ['+order']: order,
    ['+order_by']: orderBy,
    ...(search?.label !== undefined && {
      label: { '+contains': search?.label },
    }),
  };

  const {
    data: destinations,
    isLoading,
    isFetching,
    error,
  } = useDestinationsQuery(
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
      to: destinationsUrl,
    });
  };

  const navigateToCreate = () => {
    navigate({ to: '/datastream/destinations/create' });
  };

  if (isLoading) {
    return <CircleProgress />;
  }

  if (error) {
    return (
      <ErrorState errorText="There was an error retrieving your destinations. Please reload and try again." />
    );
  }

  if (!destinations?.data.length) {
    return (
      <DestinationsLandingEmptyState navigateToCreate={navigateToCreate} />
    );
  }

  return (
    <>
      <DataStreamTabHeader
        entity="Destination"
        isSearching={isFetching}
        loading={isLoading}
        onButtonClick={navigateToCreate}
        onSearch={onSearch}
        searchValue={search?.label ?? ''}
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
              active={orderBy === 'type'}
              direction={order}
              handleClick={handleOrderChange}
              label="type"
            >
              Type
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
              <TableSortCell
                active={orderBy === 'created'}
                direction={order}
                handleClick={handleOrderChange}
                label="created"
              >
                Creation Time
              </TableSortCell>
            </Hidden>
            <TableSortCell
              active={orderBy === 'updated'}
              direction={order}
              handleClick={handleOrderChange}
              label="updated"
            >
              Last Modified
            </TableSortCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {destinations?.data.map((destination) => (
            <DestinationTableRow
              destination={destination}
              key={destination.id}
            />
          ))}
        </TableBody>
      </Table>
      <PaginationFooter
        count={destinations?.results || 0}
        eventCategory="Destinations Table"
        handlePageChange={pagination.handlePageChange}
        handleSizeChange={pagination.handlePageSizeChange}
        page={pagination.page}
        pageSize={pagination.pageSize}
      />
    </>
  );
};

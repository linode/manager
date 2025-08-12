import { useDestinationsQuery } from '@linode/queries';
import { CircleProgress, ErrorState, Hidden } from '@linode/ui';
import { TableBody, TableHead, TableRow } from '@mui/material';
import Table from '@mui/material/Table';
import { useNavigate } from '@tanstack/react-router';
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

  const pagination = usePaginationV2({
    currentRoute: '/datastream/destinations',
    preferenceKey: DESTINATIONS_TABLE_PREFERENCE_KEY,
  });

  const { handleOrderChange, order, orderBy } = useOrderV2({
    initialRoute: {
      defaultOrder: {
        order: DESTINATIONS_TABLE_DEFAULT_ORDER,
        orderBy: DESTINATIONS_TABLE_DEFAULT_ORDER_BY,
      },
      from: '/datastream/destinations',
    },
    preferenceKey: `destinations-order`,
  });

  const filter = {
    ['+order']: order,
    ['+order_by']: orderBy,
  };

  const {
    data: destinations,
    isLoading,
    error,
  } = useDestinationsQuery(
    {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
    filter
  );

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

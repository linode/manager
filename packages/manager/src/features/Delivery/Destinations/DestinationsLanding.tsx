import {
  useDeleteDestinationMutation,
  useDestinationsQuery,
} from '@linode/queries';
import { CircleProgress, ErrorState, Hidden } from '@linode/ui';
import { TableBody, TableHead, TableRow } from '@mui/material';
import Table from '@mui/material/Table';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { enqueueSnackbar } from 'notistack';
import * as React from 'react';

import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { TableCell } from 'src/components/TableCell';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableSortCell } from 'src/components/TableSortCell';
import {
  DESTINATIONS_TABLE_DEFAULT_ORDER,
  DESTINATIONS_TABLE_DEFAULT_ORDER_BY,
  DESTINATIONS_TABLE_PREFERENCE_KEY,
} from 'src/features/Delivery/Destinations/constants';
import { DeleteDestinationDialog } from 'src/features/Delivery/Destinations/DeleteDestinationDialog';
import { DestinationsLandingEmptyState } from 'src/features/Delivery/Destinations/DestinationsLandingEmptyState';
import { DestinationTableRow } from 'src/features/Delivery/Destinations/DestinationTableRow';
import { DeliveryTabHeader } from 'src/features/Delivery/Shared/DeliveryTabHeader/DeliveryTabHeader';
import { useOrderV2 } from 'src/hooks/useOrderV2';
import { usePaginationV2 } from 'src/hooks/usePaginationV2';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import type { Destination } from '@linode/api-v4';
import type { DestinationHandlers } from 'src/features/Delivery/Destinations/DestinationActionMenu';

export const DestinationsLanding = () => {
  const navigate = useNavigate();
  const { mutateAsync: deleteDestination } = useDeleteDestinationMutation();
  const destinationsUrl = '/logs/delivery/destinations';

  const [deleteDialogOpen, setDeleteDialogOpen] =
    React.useState<boolean>(false);
  const [deleteError, setDeleteError] = React.useState<string | undefined>();
  const [deleteLoading, setDeleteLoading] = React.useState<boolean>(false);
  const [deleteDestinationSelection, setDeleteDestinationSelection] =
    React.useState<Destination | undefined>();

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
    navigate({ to: '/logs/delivery/destinations/create' });
  };

  if (error) {
    return (
      <ErrorState errorText="There was an error retrieving your destinations. Please reload and try again." />
    );
  }

  if (destinations?.results === 0 && !search?.label) {
    return (
      <DestinationsLandingEmptyState navigateToCreate={navigateToCreate} />
    );
  }

  const handleEdit = ({ id }: Destination) => {
    navigate({ to: `/logs/delivery/destinations/${id}/edit` });
  };

  const openDeleteDialog = (destination: Destination) => {
    setDeleteError(undefined);
    setDeleteDestinationSelection(destination);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };

  const handleDelete = () => {
    const { id, label } = deleteDestinationSelection as Destination;
    setDeleteLoading(true);
    deleteDestination({
      id,
    })
      .then(() => {
        closeDeleteDialog();
        return enqueueSnackbar(`Destination  ${label} deleted successfully`, {
          variant: 'success',
        });
      })
      .catch((error) => {
        const apiErrorReason = getAPIErrorOrDefault(
          error,
          'There was an issue deleting your destination'
        )[0].reason;

        setDeleteError(apiErrorReason);

        return enqueueSnackbar(apiErrorReason, {
          variant: 'error',
        });
      })
      .finally(() => {
        setDeleteLoading(false);
      });
  };

  const handlers: DestinationHandlers = {
    onEdit: handleEdit,
    onDelete: openDeleteDialog,
  };

  return (
    <>
      <DeliveryTabHeader
        entity="Destination"
        isSearching={isFetching}
        loading={isLoading}
        onButtonClick={navigateToCreate}
        onSearch={onSearch}
        searchValue={search?.label ?? ''}
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
                <TableCell sx={{ width: '5%' }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {destinations?.data.map((destination) => (
                <DestinationTableRow
                  destination={destination}
                  key={destination.id}
                  {...handlers}
                />
              ))}
              {destinations?.results === 0 && <TableRowEmpty colSpan={6} />}
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
          <DeleteDestinationDialog
            destination={deleteDestinationSelection}
            error={deleteError}
            loading={deleteLoading}
            onClose={closeDeleteDialog}
            onDelete={handleDelete}
            open={deleteDialogOpen}
          />
        </>
      )}
    </>
  );
};

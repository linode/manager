import CloseIcon from '@mui/icons-material/Close';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { CircleProgress } from 'src/components/CircleProgress';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { Hidden } from 'src/components/Hidden';
import { IconButton } from 'src/components/IconButton';
import { InputAdornment } from 'src/components/InputAdornment';
import { LandingHeader } from 'src/components/LandingHeader';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableSortCell } from 'src/components/TableSortCell/TableSortCell';
import { TextField } from 'src/components/TextField';
import { useOrder } from 'src/hooks/useOrder';
import { usePagination } from 'src/hooks/usePagination';
import { usePlacementGroupsQuery } from 'src/queries/placementGroups';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import { PlacementGroupsCreateDrawer } from '../PlacementGroupsCreateDrawer';
import { PlacementGroupsRenameDrawer } from '../PlacementGroupsRenameDrawer';
import { PlacementGroupsLandingEmptyState } from './PlacementGroupsLandingEmptyState';
import { PlacementGroupsRow } from './PlacementGroupsRow';

import type { PlacementGroup } from '@linode/api-v4';

const preferenceKey = 'placement-groups';

export const PlacementGroupsLanding = React.memo(() => {
  const history = useHistory();
  const pagination = usePagination(1, preferenceKey);
  const [selectedPlacementGroup, setSelectedPlacementGroup] = React.useState<
    PlacementGroup | undefined
  >();
  const [query, setQuery] = React.useState<string>('');
  const { handleOrderChange, order, orderBy } = useOrder(
    {
      order: 'asc',
      orderBy: 'label',
    },
    `${preferenceKey}-order`
  );

  const filter = {
    ['+order']: order,
    ['+order_by']: orderBy,
  };

  if (query) {
    filter['label'] = { '+contains': query };
  }

  const params = {
    page: pagination.page,
    page_size: pagination.pageSize,
  };

  const { data: placementGroups, error, isLoading } = usePlacementGroupsQuery(
    params,
    filter
  );

  const handleCreatePlacementGroup = () => {
    history.replace('/placement-groups/create');
  };

  const handleRenamePlacementGroup = (placementGroup: PlacementGroup) => {
    setSelectedPlacementGroup(placementGroup);
    history.replace(`/placement-groups/rename/${placementGroup.id}`);
  };

  const handleDeletePlacementGroup = (placementGroup: PlacementGroup) => {
    setSelectedPlacementGroup(placementGroup);
  };

  const onClosePlacementGroupDrawer = () => {
    history.replace('/placement-groups');
    setSelectedPlacementGroup(undefined);
  };

  const isPlacementGroupCreateDrawerOpen = location.pathname.endsWith('create');
  const isPlacementGroupRenameDrawerOpen = location.pathname.includes('rename');

  if (isLoading) {
    return <CircleProgress />;
  }

  if (placementGroups?.results === 0) {
    return (
      <>
        <PlacementGroupsLandingEmptyState
          openCreatePlacementGroupDrawer={handleCreatePlacementGroup}
        />
        <PlacementGroupsCreateDrawer
          numberOfPlacementGroupsCreated={placementGroups?.results ?? 0}
          onClose={onClosePlacementGroupDrawer}
          open={isPlacementGroupCreateDrawerOpen}
        />
      </>
    );
  }

  if (error) {
    return (
      <ErrorState
        errorText={
          getAPIErrorOrDefault(error, 'Error loading your Placement Groups.')[0]
            .reason
        }
      />
    );
  }

  return (
    <>
      <LandingHeader
        breadcrumbProps={{ pathname: '/placement-groups' }}
        docsLink={'TODO VM_Placement: add doc link'}
        entity="Placement Group"
        onButtonClick={handleCreatePlacementGroup}
        title="Placement Groups"
      />
      <TextField
        InputProps={{
          endAdornment: query && (
            <InputAdornment position="end">
              <IconButton
                aria-label="Clear"
                onClick={() => setQuery('')}
                size="small"
                sx={{ padding: 'unset' }}
              >
                <CloseIcon sx={{ color: '#aaa !important' }} />
              </IconButton>
            </InputAdornment>
          ),
        }}
        hideLabel
        label="Filter"
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Filter"
        sx={{ mb: 4 }}
        value={query}
      />
      <Table aria-label="List of Placement Groups">
        <TableHead>
          <TableRow>
            <TableSortCell
              active={orderBy === 'label'}
              direction={order}
              handleClick={handleOrderChange}
              label="label"
              sx={{ width: '40%' }}
            >
              Label
            </TableSortCell>
            <TableCell>Linodes</TableCell>
            <Hidden smDown>
              <TableSortCell
                active={orderBy === 'region'}
                direction={order}
                handleClick={handleOrderChange}
                label="region"
              >
                Region
              </TableSortCell>
            </Hidden>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {placementGroups?.data.map((placementGroup) => (
            <PlacementGroupsRow
              handleDeletePlacementGroup={() =>
                handleDeletePlacementGroup(placementGroup)
              }
              handleRenamePlacementGroup={() =>
                handleRenamePlacementGroup(placementGroup)
              }
              key={`pg-${placementGroup.id}`}
              placementGroup={placementGroup}
            />
          ))}
        </TableBody>
      </Table>
      <PaginationFooter
        count={placementGroups?.results ?? 0}
        eventCategory="Placement Groups Table"
        handlePageChange={pagination.handlePageChange}
        handleSizeChange={pagination.handlePageSizeChange}
        page={pagination.page}
        pageSize={pagination.pageSize}
      />
      <PlacementGroupsCreateDrawer
        numberOfPlacementGroupsCreated={placementGroups?.results ?? 0}
        onClose={onClosePlacementGroupDrawer}
        open={isPlacementGroupCreateDrawerOpen}
      />
      <PlacementGroupsRenameDrawer
        numberOfPlacementGroupsCreated={placementGroups?.results ?? 0}
        onClose={onClosePlacementGroupDrawer}
        open={isPlacementGroupRenameDrawerOpen}
        selectedPlacementGroup={selectedPlacementGroup}
      />
      {/* TODO VM_Placement: add delete dialog */}
    </>
  );
});

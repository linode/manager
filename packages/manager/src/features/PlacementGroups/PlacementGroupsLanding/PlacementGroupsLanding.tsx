import CloseIcon from '@mui/icons-material/Close';
import { useMediaQuery, useTheme } from '@mui/material';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { CircleProgress } from 'src/components/CircleProgress';
import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
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
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableSortCell } from 'src/components/TableSortCell/TableSortCell';
import { getRestrictedResourceText } from 'src/features/Account/utils';
import { useOrder } from 'src/hooks/useOrder';
import { usePagination } from 'src/hooks/usePagination';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
import { usePlacementGroupsQuery } from 'src/queries/placementGroups';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import { PlacementGroupsCreateDrawer } from '../PlacementGroupsCreateDrawer';
import { PlacementGroupsDeleteModal } from '../PlacementGroupsDeleteModal';
import { PlacementGroupsEditDrawer } from '../PlacementGroupsEditDrawer';
import { PlacementGroupsLandingEmptyState } from './PlacementGroupsLandingEmptyState';
import { PlacementGroupsRow } from './PlacementGroupsRow';

import type { PlacementGroup } from '@linode/api-v4';

const preferenceKey = 'placement-groups';

export const PlacementGroupsLanding = React.memo(() => {
  const history = useHistory();
  const pagination = usePagination(1, preferenceKey);
  const theme = useTheme();
  const [query, setQuery] = React.useState<string>('');
  const [selectedPlacementGroup, setSelectedPlacementGroup] = React.useState<
    PlacementGroup | undefined
  >(undefined);
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('md'));
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

  const {
    data: placementGroups,
    error,
    isFetching,
    isLoading,
  } = usePlacementGroupsQuery(
    {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
    filter
  );

  const isLinodeReadOnly = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_linodes',
  });

  const handleCreatePlacementGroup = () => {
    history.replace('/placement-groups/create');
  };

  const handleEditPlacementGroup = (placementGroup: PlacementGroup) => {
    setSelectedPlacementGroup(placementGroup);
    history.replace(`/placement-groups/edit/${placementGroup.id}`);
  };

  const handleDeletePlacementGroup = (placementGroup: PlacementGroup) => {
    setSelectedPlacementGroup(placementGroup);
    history.replace(`/placement-groups/delete/${placementGroup.id}`);
  };

  const onClosePlacementGroupDrawer = () => {
    history.replace('/placement-groups');
  };

  const onExited = () => {
    setSelectedPlacementGroup(undefined);
  };

  const isPlacementGroupCreateDrawerOpen = location.pathname.endsWith('create');
  const isPlacementGroupDeleteModalOpen = location.pathname.includes('delete');
  const isPlacementGroupEditDrawerOpen = location.pathname.includes('edit');

  if (isLoading) {
    return <CircleProgress />;
  }

  if (placementGroups?.results === 0 && query === '') {
    return (
      <>
        <PlacementGroupsLandingEmptyState
          disabledCreateButton={isLinodeReadOnly}
          openCreatePlacementGroupDrawer={handleCreatePlacementGroup}
        />
        <PlacementGroupsCreateDrawer
          allPlacementGroups={placementGroups.data}
          disabledPlacementGroupCreateButton={isLinodeReadOnly}
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
        buttonDataAttrs={{
          tooltipText: getRestrictedResourceText({
            action: 'create',
            isSingular: false,
            resourceType: 'Placement Groups',
          }),
        }}
        breadcrumbProps={{ pathname: '/placement-groups' }}
        disabledCreateButton={isLinodeReadOnly}
        docsLink={'TODO VM_Placement: add doc link'}
        entity="Placement Group"
        onButtonClick={handleCreatePlacementGroup}
        title="Placement Groups"
      />
      <DebouncedSearchTextField
        InputProps={{
          endAdornment: query && (
            <InputAdornment position="end">
              {isFetching && <CircleProgress mini />}

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
        debounceTime={250}
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
              sx={{ width: matchesSmDown ? '40%' : '20%' }}
            >
              Label
            </TableSortCell>
            <Hidden smDown>
              <TableSortCell
                active={orderBy === 'affinity_type'}
                direction={order}
                handleClick={handleOrderChange}
                label="affinity_type"
              >
                Affinity Type
              </TableSortCell>
            </Hidden>
            <Hidden smDown>
              <TableSortCell
                active={orderBy === 'is_strict'}
                direction={order}
                handleClick={handleOrderChange}
                label="is_strict"
                sx={{ width: '20%' }}
              >
                Affinity Type Enforcement
              </TableSortCell>
            </Hidden>
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
          {placementGroups?.data.length === 0 && <TableRowEmpty colSpan={6} />}
          {placementGroups?.data.map((placementGroup) => (
            <PlacementGroupsRow
              handleDeletePlacementGroup={() =>
                handleDeletePlacementGroup(placementGroup)
              }
              handleEditPlacementGroup={() =>
                handleEditPlacementGroup(placementGroup)
              }
              disabled={isLinodeReadOnly}
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
        allPlacementGroups={placementGroups?.data ?? []}
        disabledPlacementGroupCreateButton={isLinodeReadOnly}
        onClose={onClosePlacementGroupDrawer}
        open={isPlacementGroupCreateDrawerOpen}
      />
      <PlacementGroupsEditDrawer
        disableEditButton={isLinodeReadOnly}
        onClose={onClosePlacementGroupDrawer}
        onExited={onExited}
        open={isPlacementGroupEditDrawerOpen}
        selectedPlacementGroup={selectedPlacementGroup}
      />
      <PlacementGroupsDeleteModal
        disableUnassignButton={isLinodeReadOnly}
        onClose={onClosePlacementGroupDrawer}
        onExited={onExited}
        open={isPlacementGroupDeleteModalOpen}
        selectedPlacementGroup={selectedPlacementGroup}
      />
    </>
  );
});

import {
  useAllLinodesQuery,
  usePlacementGroupQuery,
  usePlacementGroupsQuery,
  useRegionsQuery,
} from '@linode/queries';
import { CircleProgress, ErrorState } from '@linode/ui';
import { Hidden } from '@linode/ui';
import { useMediaQuery, useTheme } from '@mui/material';
import { useNavigate, useSearch } from '@tanstack/react-router';
import * as React from 'react';

import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
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
import { useOrderV2 } from 'src/hooks/useOrderV2';
import { usePaginationV2 } from 'src/hooks/usePaginationV2';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import {
  PG_LANDING_TABLE_DEFAULT_ORDER,
  PG_LANDING_TABLE_DEFAULT_ORDER_BY,
  PG_LANDING_TABLE_PREFERENCE_KEY,
  PLACEMENT_GROUPS_DOCS_LINK,
  PLACEMENT_GROUPS_LANDING_ROUTE,
} from '../constants';
import { PlacementGroupsCreateDrawer } from '../PlacementGroupsCreateDrawer';
import { PlacementGroupsDeleteModal } from '../PlacementGroupsDeleteModal';
import { PlacementGroupsEditDrawer } from '../PlacementGroupsEditDrawer';
import { getPlacementGroupLinodes } from '../utils';
import { PlacementGroupsLandingEmptyState } from './PlacementGroupsLandingEmptyState';
import { PlacementGroupsRow } from './PlacementGroupsRow';

import type { Filter, PlacementGroup } from '@linode/api-v4';

export const PlacementGroupsLanding = React.memo(() => {
  const navigate = useNavigate();
  const pagination = usePaginationV2({
    currentRoute: PLACEMENT_GROUPS_LANDING_ROUTE,
    preferenceKey: PG_LANDING_TABLE_PREFERENCE_KEY,
    searchParams: (prev) => ({
      ...prev,
      query: search.query,
    }),
  });
  const search = useSearch({
    from: PLACEMENT_GROUPS_LANDING_ROUTE,
  });
  const { query } = search;
  const theme = useTheme();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('md'));
  const { handleOrderChange, order, orderBy } = useOrderV2({
    initialRoute: {
      defaultOrder: {
        order: PG_LANDING_TABLE_DEFAULT_ORDER,
        orderBy: PG_LANDING_TABLE_DEFAULT_ORDER_BY,
      },
      from: PLACEMENT_GROUPS_LANDING_ROUTE,
    },
    preferenceKey: `${PG_LANDING_TABLE_PREFERENCE_KEY}-order`,
  });

  const filter: Filter = {
    ['+order']: order,
    ['+order_by']: orderBy,
    ...(query && { label: { '+contains': query } }),
  };

  const {
    data: placementGroups,
    error,
    isFetching,
    isLoading: placementGroupsLoading,
  } = usePlacementGroupsQuery(
    {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
    filter
  );

  const allLinodeIDsAssigned = placementGroups?.data.reduce(
    (acc, placementGroup) => {
      return acc.concat(
        placementGroup.members.map((member) => member.linode_id)
      );
    },
    [] as number[]
  );

  const { data: linodes } = useAllLinodesQuery(
    {},
    {
      '+or': allLinodeIDsAssigned?.map((linodeId) => ({ id: linodeId })),
    }
  );

  const {
    data: selectedPlacementGroup,
    isFetching: isFetchingPlacementGroup,
    isLoading: isLoadingPlacementGroup,
    error: selectedPlacementGroupError,
  } = usePlacementGroupQuery(Number(search.id), !!search.id);

  const { data: regions } = useRegionsQuery();
  const getPlacementGroupRegion = (
    placementGroup: PlacementGroup | undefined
  ) => {
    return regions?.find((region) => region.id === placementGroup?.region);
  };

  const isLinodeReadOnly = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_linodes',
  });

  const handleCreatePlacementGroup = () => {
    navigate({
      search: (prev) => ({
        ...prev,
        action: 'create',
      }),
      to: PLACEMENT_GROUPS_LANDING_ROUTE,
    });
  };

  const handleEditPlacementGroup = (placementGroup: PlacementGroup) => {
    navigate({
      search: (prev) => ({
        ...prev,
        action: 'edit',
        id: placementGroup.id,
      }),
      to: PLACEMENT_GROUPS_LANDING_ROUTE,
    });
  };

  const handleDeletePlacementGroup = (placementGroup: PlacementGroup) => {
    navigate({
      search: (prev) => ({
        ...prev,
        action: 'delete',
        id: placementGroup.id,
      }),
      to: '/placement-groups',
    });
  };

  const onClosePlacementGroupDrawer = () => {
    navigate({
      search: (prev) => ({
        ...prev,
        action: undefined,
        id: undefined,
      }),
      to: PLACEMENT_GROUPS_LANDING_ROUTE,
    });
  };

  const onSearch = (searchString: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        page: undefined,
        query: searchString || undefined,
        action: undefined,
        id: undefined,
      }),
      to: PLACEMENT_GROUPS_LANDING_ROUTE,
    });
  };

  if (placementGroupsLoading) {
    return <CircleProgress />;
  }

  if (placementGroups?.results === 0 && !query) {
    return (
      <>
        <PlacementGroupsLandingEmptyState
          disabledCreateButton={isLinodeReadOnly}
          openCreatePlacementGroupDrawer={handleCreatePlacementGroup}
        />
        <PlacementGroupsCreateDrawer
          disabledPlacementGroupCreateButton={isLinodeReadOnly}
          onClose={onClosePlacementGroupDrawer}
          open={search.action === 'create'}
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
        breadcrumbProps={{ pathname: PLACEMENT_GROUPS_LANDING_ROUTE }}
        buttonDataAttrs={{
          tooltipText: getRestrictedResourceText({
            action: 'create',
            isSingular: false,
            resourceType: 'Placement Groups',
          }),
        }}
        disabledCreateButton={isLinodeReadOnly}
        docsLink={PLACEMENT_GROUPS_DOCS_LINK}
        entity="Placement Group"
        onButtonClick={handleCreatePlacementGroup}
        spacingBottom={16}
        title="Placement Groups"
      />
      <DebouncedSearchTextField
        clearable
        debounceTime={250}
        hideLabel
        isSearching={isFetching}
        label="Search"
        onSearch={onSearch}
        placeholder="Search Placement Groups"
        sx={{ mb: 3 }}
        value={query ?? ''}
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
                active={orderBy === 'placement_group_type'}
                direction={order}
                handleClick={handleOrderChange}
                label="placement_group_type"
              >
                Placement Group Type
              </TableSortCell>
            </Hidden>
            <Hidden smDown>
              <TableSortCell
                active={orderBy === 'placement_group_policy'}
                direction={order}
                handleClick={handleOrderChange}
                label="placement_group_policy"
                sx={{ width: '20%' }}
              >
                Placement Group Policy
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
              assignedLinodes={getPlacementGroupLinodes(
                placementGroup,
                linodes
              )}
              disabled={isLinodeReadOnly}
              handleDeletePlacementGroup={() =>
                handleDeletePlacementGroup(placementGroup)
              }
              handleEditPlacementGroup={() =>
                handleEditPlacementGroup(placementGroup)
              }
              key={`pg-${placementGroup.id}`}
              placementGroup={placementGroup}
              region={getPlacementGroupRegion(placementGroup)}
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
        disabledPlacementGroupCreateButton={isLinodeReadOnly}
        onClose={onClosePlacementGroupDrawer}
        open={search.action === 'create'}
      />
      <PlacementGroupsEditDrawer
        disableEditButton={isLinodeReadOnly}
        isFetching={isFetchingPlacementGroup}
        onClose={onClosePlacementGroupDrawer}
        open={search.action === 'edit'}
        region={getPlacementGroupRegion(selectedPlacementGroup)}
        selectedPlacementGroup={selectedPlacementGroup}
        selectedPlacementGroupError={selectedPlacementGroupError}
      />
      <PlacementGroupsDeleteModal
        disableUnassignButton={isLinodeReadOnly}
        isFetching={isLoadingPlacementGroup}
        linodes={linodes}
        onClose={onClosePlacementGroupDrawer}
        open={search.action === 'delete'}
        selectedPlacementGroup={selectedPlacementGroup}
        selectedPlacementGroupError={selectedPlacementGroupError}
      />
    </>
  );
});

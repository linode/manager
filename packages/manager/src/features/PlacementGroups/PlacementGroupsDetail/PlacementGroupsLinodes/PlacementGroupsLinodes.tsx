import { useAllLinodesQuery, useLinodeQuery } from '@linode/queries';
import { Button, ErrorState, Stack } from '@linode/ui';
import Grid from '@mui/material/Grid';
import { useNavigate, useSearch } from '@tanstack/react-router';
import * as React from 'react';

import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { hasPlacementGroupReachedCapacity } from 'src/features/PlacementGroups/utils';
import { useOrderV2 } from 'src/hooks/useOrderV2';
import { usePaginationV2 } from 'src/hooks/usePaginationV2';

import {
  MAX_NUMBER_OF_LINODES_IN_PLACEMENT_GROUP_MESSAGE,
  PG_LANDING_TABLE_DEFAULT_ORDER,
  PG_LANDING_TABLE_DEFAULT_ORDER_BY,
  PG_LINODES_TABLE_PREFERENCE_KEY,
  PLACEMENT_GROUP_LINODES_ERROR_MESSAGE,
  PLACEMENT_GROUPS_DETAILS_ROUTE,
} from '../../constants';
import { PlacementGroupsAssignLinodesDrawer } from '../../PlacementGroupsAssignLinodesDrawer';
import { PlacementGroupsUnassignModal } from '../../PlacementGroupsUnassignModal';
import { PlacementGroupsLinodesTable } from './PlacementGroupsLinodesTable';

import type { Filter, Linode, PlacementGroup, Region } from '@linode/api-v4';

interface Props {
  isLinodeReadOnly: boolean;
  placementGroup: PlacementGroup | undefined;
  region: Region | undefined;
}

export const PlacementGroupsLinodes = (props: Props) => {
  const { isLinodeReadOnly, placementGroup, region } = props;
  const navigate = useNavigate();
  const search = useSearch({
    from: PLACEMENT_GROUPS_DETAILS_ROUTE,
  });
  const { query } = search;

  const { handleOrderChange, order, orderBy } = useOrderV2({
    initialRoute: {
      defaultOrder: {
        order: PG_LANDING_TABLE_DEFAULT_ORDER,
        orderBy: PG_LANDING_TABLE_DEFAULT_ORDER_BY,
      },
      from: PLACEMENT_GROUPS_DETAILS_ROUTE,
    },
    preferenceKey: `${PG_LINODES_TABLE_PREFERENCE_KEY}-order`,
  });

  const pagination = usePaginationV2({
    currentRoute: PLACEMENT_GROUPS_DETAILS_ROUTE,
    preferenceKey: PG_LINODES_TABLE_PREFERENCE_KEY,
    searchParams: (prev) => ({
      ...prev,
      query: search.query,
    }),
  });

  const filter: Filter = {
    ['+or']: placementGroup?.members.map((member) => ({
      id: member.linode_id,
    })),
    ['+order']: order,
    ['+order_by']: orderBy,
    ...(query && { label: { '+contains': query } }),
  };

  const { data: linodes, isFetching: isFetchingLinodes } = useAllLinodesQuery(
    {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
    filter
  );

  const assignedLinodes = linodes?.filter((linode) =>
    placementGroup?.members.some((pgLinode) => pgLinode.linode_id === linode.id)
  );

  const {
    data: selectedLinode,
    isFetching: isFetchingLinode,
    error: selectedLinodeError,
  } = useLinodeQuery(search.linodeId ?? -1, !!search.linodeId);

  if (!placementGroup) {
    return <ErrorState errorText={PLACEMENT_GROUP_LINODES_ERROR_MESSAGE} />;
  }

  const onSearch = (searchString: string) => {
    navigate({
      params: { id: placementGroup.id },
      search: (prev) => ({
        ...prev,
        page: undefined,
        query: searchString || undefined,
        linodeId: undefined,
        action: undefined,
      }),
      to: PLACEMENT_GROUPS_DETAILS_ROUTE,
    });
  };

  const hasReachedCapacity = hasPlacementGroupReachedCapacity({
    placementGroup,
    region,
  });

  const handleAssignLinodesDrawer = () => {
    navigate({
      search: (prev) => ({
        ...prev,
        action: 'assign',
        linodeId: undefined,
      }),
      params: { id: placementGroup.id },
      to: PLACEMENT_GROUPS_DETAILS_ROUTE,
    });
  };

  const handleUnassignLinodeModal = (linode: Linode) => {
    navigate({
      search: (prev) => ({
        ...prev,
        action: 'unassign',
        linodeId: linode.id,
      }),
      params: { id: placementGroup.id },
      to: PLACEMENT_GROUPS_DETAILS_ROUTE,
    });
  };

  const handleCloseDrawer = () => {
    navigate({
      params: { id: placementGroup.id },
      search: (prev) => ({
        ...prev,
        action: undefined,
        linodeId: undefined,
      }),
      to: PLACEMENT_GROUPS_DETAILS_ROUTE,
    });
  };

  return (
    <Stack spacing={3}>
      <Grid
        container
        sx={{
          justifyContent: 'space-between',
        }}
      >
        <Grid
          size={{
            sm: 6,
            xs: 12,
          }}
          sx={{
            flexGrow: 1,
          }}
        >
          <DebouncedSearchTextField
            clearable
            debounceTime={250}
            hideLabel
            label="Search Linodes"
            onSearch={onSearch}
            placeholder="Search Linodes"
            value={query ?? ''}
          />
        </Grid>
        <Grid>
          <Button
            buttonType="primary"
            data-testid="add-linode-to-placement-group-button"
            disabled={hasReachedCapacity || isLinodeReadOnly}
            onClick={handleAssignLinodesDrawer}
            tooltipText={
              isLinodeReadOnly
                ? ''
                : MAX_NUMBER_OF_LINODES_IN_PLACEMENT_GROUP_MESSAGE
            }
          >
            Assign Linode to Placement Group
          </Button>
        </Grid>
      </Grid>
      <PlacementGroupsLinodesTable
        handleUnassignLinodeModal={handleUnassignLinodeModal}
        isFetchingLinodes={isFetchingLinodes}
        linodes={assignedLinodes ?? []}
        orderByProps={{ handleOrderChange, order, orderBy }}
      />
      <PaginationFooter
        count={assignedLinodes?.length ?? 0}
        eventCategory="Placement Group Linodes Table"
        handlePageChange={pagination.handlePageChange}
        handleSizeChange={pagination.handlePageSizeChange}
        page={pagination.page}
        pageSize={pagination.pageSize}
      />
      <PlacementGroupsAssignLinodesDrawer
        onClose={handleCloseDrawer}
        open={search.action === 'assign'}
        region={region}
        selectedPlacementGroup={placementGroup}
      />
      <PlacementGroupsUnassignModal
        isFetching={isFetchingLinode}
        onClose={handleCloseDrawer}
        open={search.action === 'unassign'}
        selectedLinode={selectedLinode}
        selectedLinodeError={selectedLinodeError}
      />
    </Stack>
  );
};

import { Button, Stack } from '@linode/ui';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import { useLocation, useNavigate, useSearch } from '@tanstack/react-router';
import * as React from 'react';

import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { hasPlacementGroupReachedCapacity } from 'src/features/PlacementGroups/utils';

import {
  MAX_NUMBER_OF_LINODES_IN_PLACEMENT_GROUP_MESSAGE,
  PLACEMENT_GROUP_LINODES_ERROR_MESSAGE,
  PLACEMENT_GROUPS_DETAILS_ROUTE,
} from '../../constants';
import { PlacementGroupsAssignLinodesDrawer } from '../../PlacementGroupsAssignLinodesDrawer';
import { PlacementGroupsUnassignModal } from '../../PlacementGroupsUnassignModal';
import { PlacementGroupsLinodesTable } from './PlacementGroupsLinodesTable';

import type { Linode, PlacementGroup, Region } from '@linode/api-v4';
import type { PlacementGroupsSearchParams } from 'src/routes/placementGroups';

interface Props {
  assignedLinodes: Linode[] | undefined;
  isFetchingLinodes: boolean;
  isLinodeReadOnly: boolean;
  placementGroup: PlacementGroup | undefined;
  region: Region | undefined;
}

type PlacementGroupLinodesSearchParams = PlacementGroupsSearchParams;

export const PlacementGroupsLinodes = (props: Props) => {
  const {
    assignedLinodes,
    isFetchingLinodes,
    isLinodeReadOnly,
    placementGroup,
    region,
  } = props;
  const navigate = useNavigate();
  const location = useLocation();
  const search: PlacementGroupLinodesSearchParams = useSearch({
    from: PLACEMENT_GROUPS_DETAILS_ROUTE,
  });
  const { query } = search;
  const [selectedLinode, setSelectedLinode] = React.useState<
    Linode | undefined
  >();

  if (!placementGroup) {
    return <ErrorState errorText={PLACEMENT_GROUP_LINODES_ERROR_MESSAGE} />;
  }

  const getLinodesList = () => {
    if (!assignedLinodes) {
      return [];
    }

    if (query) {
      return assignedLinodes.filter((linode: Linode) => {
        return linode.label.toLowerCase().includes(query.toLowerCase());
      });
    }

    return assignedLinodes;
  };

  const onSearch = (searchString: string) => {
    navigate({
      params: { id: placementGroup.id },
      search: (prev) => ({
        ...prev,
        page: undefined,
        query: searchString || undefined,
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
      params: { id: placementGroup.id },
      search: (prev) => prev,
      to: '/placement-groups/$id/linodes/assign',
    });
  };
  const handleUnassignLinodeModal = (linode: Linode) => {
    setSelectedLinode(linode);
    navigate({
      params: { id: placementGroup.id, linodeId: linode.id },
      search: (prev) => prev,
      to: '/placement-groups/$id/linodes/unassign/$linodeId',
    });
  };
  const handleCloseDrawer = () => {
    setSelectedLinode(undefined);
    navigate({
      params: { id: placementGroup.id },
      search: (prev) => prev,
      to: PLACEMENT_GROUPS_DETAILS_ROUTE,
    });
  };
  const isAssignLinodesDrawerOpen = location.pathname.includes('/assign');
  const isUnassignLinodesDrawerOpen = location.pathname.includes('/unassign');

  return (
    <Stack spacing={2}>
      <Grid container justifyContent="space-between">
        <Grid flexGrow={1} sm={6} sx={{ mb: 1 }} xs={12}>
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
            tooltipText={
              isLinodeReadOnly
                ? ''
                : MAX_NUMBER_OF_LINODES_IN_PLACEMENT_GROUP_MESSAGE
            }
            buttonType="primary"
            data-testid="add-linode-to-placement-group-button"
            disabled={hasReachedCapacity || isLinodeReadOnly}
            onClick={handleAssignLinodesDrawer}
          >
            Assign Linode to Placement Group
          </Button>
        </Grid>
      </Grid>
      <PlacementGroupsLinodesTable
        handleUnassignLinodeModal={handleUnassignLinodeModal}
        isFetchingLinodes={isFetchingLinodes}
        linodes={getLinodesList() ?? []}
      />
      <PlacementGroupsAssignLinodesDrawer
        onClose={handleCloseDrawer}
        open={isAssignLinodesDrawerOpen}
        region={region}
        selectedPlacementGroup={placementGroup}
      />
      <PlacementGroupsUnassignModal
        onClose={handleCloseDrawer}
        open={isUnassignLinodesDrawerOpen}
        selectedLinode={selectedLinode}
      />
    </Stack>
  );
};

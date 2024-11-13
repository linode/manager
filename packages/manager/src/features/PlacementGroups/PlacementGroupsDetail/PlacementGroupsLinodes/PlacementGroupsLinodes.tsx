import { Stack } from '@linode/ui';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { Button } from 'src/components/Button/Button';
import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { hasPlacementGroupReachedCapacity } from 'src/features/PlacementGroups/utils';

import {
  MAX_NUMBER_OF_LINODES_IN_PLACEMENT_GROUP_MESSAGE,
  PLACEMENT_GROUP_LINODES_ERROR_MESSAGE,
} from '../../constants';
import { PlacementGroupsAssignLinodesDrawer } from '../../PlacementGroupsAssignLinodesDrawer';
import { PlacementGroupsUnassignModal } from '../../PlacementGroupsUnassignModal';
import { PlacementGroupsLinodesTable } from './PlacementGroupsLinodesTable';

import type { Linode, PlacementGroup, Region } from '@linode/api-v4';

interface Props {
  assignedLinodes: Linode[] | undefined;
  isFetchingLinodes: boolean;
  isLinodeReadOnly: boolean;
  placementGroup: PlacementGroup | undefined;
  region: Region | undefined;
}

export const PlacementGroupsLinodes = (props: Props) => {
  const {
    assignedLinodes,
    isFetchingLinodes,
    isLinodeReadOnly,
    placementGroup,
    region,
  } = props;
  const history = useHistory();
  const [searchText, setSearchText] = React.useState('');
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

    if (searchText) {
      return assignedLinodes.filter((linode: Linode) => {
        return linode.label.toLowerCase().includes(searchText.toLowerCase());
      });
    }

    return assignedLinodes;
  };

  const hasReachedCapacity = hasPlacementGroupReachedCapacity({
    placementGroup,
    region,
  });

  const handleAssignLinodesDrawer = () => {
    history.replace(`/placement-groups/${placementGroup.id}/linodes/assign`);
  };
  const handleUnassignLinodeModal = (linode: Linode) => {
    setSelectedLinode(linode);
    history.replace(
      `/placement-groups/${placementGroup.id}/linodes/unassign/${linode.id}`
    );
  };
  const handleExitedUnassignModal = () => {
    setSelectedLinode(undefined);
  };
  const handleCloseDrawer = () => {
    history.replace(`/placement-groups/${placementGroup.id}/linodes`);
  };
  const isAssignLinodesDrawerOpen = history.location.pathname.includes(
    '/assign'
  );
  const isUnassignLinodesDrawerOpen = history.location.pathname.includes(
    '/unassign'
  );

  return (
    <Stack spacing={2}>
      <Grid container justifyContent="space-between">
        <Grid flexGrow={1} sm={6} sx={{ mb: 1 }} xs={12}>
          <DebouncedSearchTextField
            clearable
            debounceTime={250}
            hideLabel
            label="Search Linodes"
            onSearch={setSearchText}
            placeholder="Search Linodes"
            value={searchText}
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
        onExited={handleExitedUnassignModal}
        open={isUnassignLinodesDrawerOpen}
        selectedLinode={selectedLinode}
      />
    </Stack>
  );
};

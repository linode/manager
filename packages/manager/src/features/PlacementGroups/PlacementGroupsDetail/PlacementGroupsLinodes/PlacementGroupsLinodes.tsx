import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { Stack } from 'src/components/Stack';
import { Typography } from 'src/components/Typography';
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
  const theme = useTheme();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('md'));
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
      <Box sx={{ px: matchesSmDown ? 2 : 0, py: 2 }}>
        <Typography>
          The following Linodes have been assigned to this Placement Group. A
          Linode can only be assigned to a single Placement Group.
        </Typography>
        <Typography sx={{ mt: 1 }}>
          Limit of Linodes for this Placement Group:{' '}
          {region?.maximum_vms_per_pg}
        </Typography>
      </Box>

      <Grid container justifyContent="space-between">
        <Grid flexGrow={1} sm={6} sx={{ mb: 1 }} xs={12}>
          <DebouncedSearchTextField
            onSearch={(value) => {
              setSearchText(value);
            }}
            debounceTime={250}
            hideLabel
            label="Search Linodes"
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

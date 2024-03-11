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
import { usePlacementGroupData } from 'src/hooks/usePlacementGroupsData';

import {
  MAX_NUMBER_OF_LINODES_IN_PLACEMENT_GROUP_MESSAGE,
  PLACEMENT_GROUP_LINODES_ERROR_MESSAGE,
} from '../../constants';
import { PlacementGroupsAssignLinodesDrawer } from '../../PlacementGroupsAssignLinodesDrawer';
import { PlacementGroupsUnassignModal } from '../../PlacementGroupsUnassignModal';
import { PlacementGroupsLinodesTable } from './PlacementGroupsLinodesTable';

import type { Linode, PlacementGroup } from '@linode/api-v4';

interface Props {
  isLinodeReadOnly: boolean;
  placementGroup: PlacementGroup | undefined;
}

export const PlacementGroupsLinodes = ({
  isLinodeReadOnly,
  placementGroup,
}: Props) => {
  const history = useHistory();
  const {
    assignedLinodes,
    hasReachedCapacity,
    isLoading,
    linodesError,
    region,
  } = usePlacementGroupData({
    placementGroup,
  });
  const theme = useTheme();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('md'));
  const [searchText, setSearchText] = React.useState('');

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

  const handleOpenAssignLinodesDrawer = () => {
    history.replace(`/placement-groups/${placementGroup.id}/linodes/assign`);
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
            onClick={handleOpenAssignLinodesDrawer}
          >
            Assign Linode to Placement Group
          </Button>
        </Grid>
      </Grid>
      <PlacementGroupsLinodesTable
        error={linodesError ?? []}
        linodes={getLinodesList() ?? []}
        loading={isLoading}
      />
      <PlacementGroupsAssignLinodesDrawer
        onClose={handleCloseDrawer}
        open={isAssignLinodesDrawerOpen}
        selectedPlacementGroup={placementGroup}
      />
      <PlacementGroupsUnassignModal
        onClose={handleCloseDrawer}
        open={isUnassignLinodesDrawerOpen}
      />
    </Stack>
  );
};

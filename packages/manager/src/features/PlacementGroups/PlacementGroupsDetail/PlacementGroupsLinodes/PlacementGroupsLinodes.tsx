import { useTheme } from '@mui/material';
import { useMediaQuery } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import * as React from 'react';

import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { Stack } from 'src/components/Stack';
import { Typography } from 'src/components/Typography';
import { useAllLinodesQuery } from 'src/queries/linodes/linodes';

import {
  MAX_NUMBER_OF_LINODES_IN_PLACEMENT_GROUP_MESSAGE,
  PLACEMENT_GROUP_LINODES_ERROR_MESSAGE,
} from '../../constants';
import { hasPlacementGroupReachedCapacity } from '../../utils';
import { PlacementGroupsLinodesTable } from './PlacementGroupsLinodesTable';

import type { Linode, PlacementGroup } from '@linode/api-v4';

interface Props {
  placementGroup: PlacementGroup | undefined;
}

export const PlacementGroupsLinodes = (props: Props) => {
  const { placementGroup } = props;
  const {
    data: placementGroupLinodes,
    error: linodesError,
    isLoading: linodesLoading,
  } = useAllLinodesQuery(
    {},
    {
      '+or': placementGroup?.linode_ids.map((id) => ({
        id,
      })),
    }
  );
  const theme = useTheme();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('md'));
  const [searchText, setSearchText] = React.useState('');

  if (!placementGroup) {
    return <ErrorState errorText={PLACEMENT_GROUP_LINODES_ERROR_MESSAGE} />;
  }

  const { capacity } = placementGroup;

  const getLinodesList = () => {
    if (!placementGroupLinodes) {
      return [];
    }

    if (searchText) {
      return placementGroupLinodes.filter((linode: Linode) => {
        return linode.label.toLowerCase().includes(searchText.toLowerCase());
      });
    }

    return placementGroupLinodes;
  };

  return (
    <Stack spacing={2}>
      <Box sx={{ px: matchesSmDown ? 2 : 0, py: 2 }}>
        <Typography>
          The following Linodes have been assigned to this Placement Group. A
          Linode can only be assigned to a single Placement Group.
        </Typography>
        <Typography sx={{ mt: 1 }}>
          Limit of Linodes for this Placement Group: {capacity}
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
            buttonType="primary"
            data-testid="add-linode-to-placement-group-button"
            disabled={hasPlacementGroupReachedCapacity(placementGroup)}
            // onClick={TODO VM_Placement: open assign linode drawer}
            tooltipText={MAX_NUMBER_OF_LINODES_IN_PLACEMENT_GROUP_MESSAGE}
          >
            Add Linode to Placement Group
          </Button>
        </Grid>
      </Grid>
      <PlacementGroupsLinodesTable
        error={linodesError ?? []}
        linodes={getLinodesList() ?? []}
        loading={linodesLoading}
      />
      {/* TODO VM_Placement: ASSIGN LINODE DRAWER */}
      {/* TODO VM_Placement: UNASSIGN LINODE DRAWER */}
    </Stack>
  );
};

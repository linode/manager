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
    data: allLinodes,
    error: linodesError,
    isLoading: linodesLoading,
  } = useAllLinodesQuery();
  const [searchText, setSearchText] = React.useState('');
  const [filteredLinodes, setFilteredLinodes] = React.useState<Linode[]>([]);

  const placementGroupLinodes = allLinodes?.filter((linode: Linode) => {
    return placementGroup?.linode_ids.includes(linode.id);
  });

  React.useEffect(() => {
    setFilteredLinodes(placementGroupLinodes || []);
  }, [allLinodes]);

  if (!placementGroup) {
    return <ErrorState errorText={PLACEMENT_GROUP_LINODES_ERROR_MESSAGE} />;
  }

  const { capacity } = placementGroup;

  const filter = (value: string) => {
    setSearchText(value);
    const filtered = placementGroupLinodes?.filter((linode: Linode) => {
      return linode.label.toLowerCase().includes(value.toLowerCase());
    });
    setFilteredLinodes(filtered ?? []);
  };

  return (
    <Stack spacing={2}>
      <Box sx={{ py: 2 }}>
        <Typography>
          The following Linodes have been assigned to this Placement Group. A
          Linode can only be assigned to a single Placement Group.
        </Typography>
        <Typography sx={{ mt: 1 }}>
          Limit of Linodes for this Placement Group: {capacity}
        </Typography>
      </Box>

      <Grid container justifyContent="space-between">
        <Grid flexGrow={1}>
          <DebouncedSearchTextField
            onSearch={(value) => {
              filter(value);
            }}
            debounceTime={250}
            hideLabel
            label="Search Linodes"
            placeholder={`Search Linodes`}
            value={searchText}
          />
        </Grid>
        <Grid>
          <Button
            buttonType="primary"
            data-testid="add-linode-to-placement-group-button"
            disabled={hasPlacementGroupReachedCapacity(placementGroup)}
            tooltipText={MAX_NUMBER_OF_LINODES_IN_PLACEMENT_GROUP_MESSAGE}
            // onClick={handleOpen} TODO VM_Placement: add onClick prop when drawer is ready
          >
            Add Linode to Placement Group
          </Button>
        </Grid>
      </Grid>
      <PlacementGroupsLinodesTable
        error={linodesError ?? []}
        linodes={filteredLinodes ?? []}
        loading={linodesLoading}
      />
      {/* TODO VM_Placement: ADD LINODES DRAWER */}
      {/* TODO VM_Placement: UNASSIGN LINODE DRAWER */}
    </Stack>
  );
};

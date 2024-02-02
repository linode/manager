import { AFFINITY_TYPES } from '@linode/api-v4';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { RemovableSelectionsList } from 'src/components/RemovableSelectionsList/RemovableSelectionsList';
import { Stack } from 'src/components/Stack';
import { Typography } from 'src/components/Typography';
import { useAllLinodesQuery } from 'src/queries/linodes/linodes';
import { useAssignLinodesToPlacementGroup } from 'src/queries/placementGroups';
import { useRegionsQuery } from 'src/queries/regions';

import { LinodeSelect } from '../Linodes/LinodeSelect/LinodeSelect';

import type { PlacementGroupsAssignLinodesDrawerProps } from './types';
import type {
  AssignLinodesToPlacementGroupPayload,
  Linode,
  Region,
} from '@linode/api-v4';

export const PlacementGroupsAssignLinodesDrawer = (
  props: PlacementGroupsAssignLinodesDrawerProps
) => {
  const {
    onClose,
    // onLinodeAddedToPlacementGroup,
    open,
    selectedPlacementGroup,
  } = props;
  const { data: linodes } = useAllLinodesQuery();
  const { data: regions } = useRegionsQuery();
  const { mutateAsync } = useAssignLinodesToPlacementGroup(
    selectedPlacementGroup?.id ?? 0
  );
  const [linodesSelectOptions, setLinodesSelectOptions] = React.useState<
    Linode[]
  >([]);
  const [selectedLinode, setSelectedLinode] = React.useState<Linode | null>(
    null
  );
  const [localLinodesSelection, setLocalLinodesSelection] = React.useState<
    Linode[]
  >([]);
  const [generalError, setGeneralError] = React.useState<string | undefined>(
    undefined
  );

  React.useEffect(() => {
    const linodesFilteredByRegion = linodes?.filter(
      (linode) => linode.region === selectedPlacementGroup?.region
    );

    const selection = linodesFilteredByRegion?.filter(
      (linode) => !localLinodesSelection.find((l) => l.id === linode.id)
    );

    setLinodesSelectOptions(selection ?? []);
  }, [linodes, localLinodesSelection, selectedPlacementGroup]);

  if (!linodes) {
    return null;
  }

  if (!selectedPlacementGroup) {
    return null;
  }

  const { affinity_type, label } = selectedPlacementGroup;
  const placementGroupRegion: Region | undefined = regions?.find(
    (region) => region.id === selectedPlacementGroup.region
  );
  const linodeSelectLabel = placementGroupRegion
    ? `Linodes in ${placementGroupRegion.label} (${placementGroupRegion.id})`
    : 'Linodes';

  const drawerTitle =
    label && affinity_type
      ? `Add Linodes to Placement Group ${label} (${AFFINITY_TYPES[affinity_type]})`
      : 'Add Linodes to Placement Group';

  // const onAssignLinode = (linode: Linode) => {
  //   setLocalLinodesSelection([...localLinodesSelection, linode]);
  //   setFieldValue('linodes', linode.id);
  // };

  const onFormSubmit = async (e: React.SyntheticEvent<HTMLElement>) => {
    e.preventDefault();

    if (!selectedLinode) {
      return;
    }

    setLocalLinodesSelection([...localLinodesSelection, selectedLinode]);

    const payload: AssignLinodesToPlacementGroupPayload = {
      linodes: [selectedLinode.id],
    };

    try {
      await mutateAsync(payload);
    } catch (error) {
      setGeneralError(
        error
          ? error[0].reason
          : 'An error occurred while adding the Linode to the group'
      );
    }
  };

  return (
    <Drawer onClose={onClose} open={open} title={drawerTitle}>
      <Grid>
        {generalError ? <Notice text={generalError} variant="error" /> : null}
        <form onSubmit={onFormSubmit}>
          <Stack spacing={1}>
            <Typography>
              A Linode can only be assigned to a single Placement Group.
            </Typography>

            <Typography>
              If you need to add a new Linode, go to{' '}
              <Link to="/linodes/create">Create Linode</Link> and return to this
              page to assign it to this Placement Group.
            </Typography>
            <LinodeSelect
              onSelectionChange={(value) => {
                setSelectedLinode(value);
              }}
              disabled={false}
              // errorText={errors?.linodes?.[0] ?? ''}
              helperText="Only displaying Linodes that aren’t assigned to a Placement Group"
              label={linodeSelectLabel}
              options={linodesSelectOptions}
              value={selectedLinode?.id ?? null}
            />

            <ActionsPanel
              primaryButtonProps={{
                'data-testid': 'submit',
                // disabled: !selectedLinode,
                label: 'Add Linode',
                // loading: isSubmitting,
                type: 'submit',
              }}
              sx={{ pt: 2 }}
            />
            <RemovableSelectionsList
              LabelComponent={({ selection }) => {
                return (
                  <Typography component="span">{selection.label}</Typography>
                );
              }}
              onRemove={(data) => {
                // handleUnassignLinode(data as LinodeAndConfigData);
                // setUnassignLinodesErrors([]);
              }}
              headerText={`Linodes Assigned to Placement Group`}
              noDataText={'No Linodes have been assigned.'}
              preferredDataLabel="linodeConfigLabel"
              selectionData={localLinodesSelection}
            />
          </Stack>
        </form>
      </Grid>
    </Drawer>
  );
};

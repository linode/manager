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
import {
  useAssignLinodesToPlacementGroup,
  useUnassignLinodesFromPlacementGroup,
} from 'src/queries/placementGroups';
import { useRegionsQuery } from 'src/queries/regions';

import { LinodeSelect } from '../Linodes/LinodeSelect/LinodeSelect';

import type { PlacementGroupsAssignLinodesDrawerProps } from './types';
import type {
  AssignLinodesToPlacementGroupPayload,
  Linode,
  Region,
  UnassignLinodesFromPlacementGroupPayload,
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
  const { mutateAsync: assignLinodes } = useAssignLinodesToPlacementGroup(
    selectedPlacementGroup?.id ?? -1
  );
  const { mutateAsync: unassignLinodes } = useUnassignLinodesFromPlacementGroup(
    selectedPlacementGroup?.id ?? -1
  );
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
    if (!open) {
      return;
    }

    setSelectedLinode(null);
    setLocalLinodesSelection([]);
    setGeneralError(undefined);
  }, [open]);

  const getLinodeSelectOptions = (): Linode[] => {
    return (
      linodes?.filter((linode) => {
        const isInRegion = linode.region === selectedPlacementGroup?.region;
        const isNotAlreadyAssigned = !selectedPlacementGroup?.linode_ids.includes(
          linode.id as number
        );
        const isNotAssignedInDrawer = !localLinodesSelection.find(
          (l) => l.id === linode.id
        );

        return isInRegion && isNotAlreadyAssigned && isNotAssignedInDrawer;
      }) ?? []
    );
  };

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

  const handleAssignLinode = async (e: React.SyntheticEvent<HTMLElement>) => {
    e.preventDefault();
    setSelectedLinode(null);

    if (!selectedLinode) {
      return;
    }

    setLocalLinodesSelection([...localLinodesSelection, selectedLinode]);

    const payload: AssignLinodesToPlacementGroupPayload = {
      linodes: [selectedLinode.id],
    };

    try {
      await assignLinodes(payload);
    } catch (error) {
      setGeneralError(
        error?.[0]?.reason
          ? error[0].reason
          : 'An error occurred while adding the Linode to the group'
      );
    }
  };

  const handleUnassignLinode = (linode: Linode) => {
    setLocalLinodesSelection(
      localLinodesSelection.filter((l) => l.id !== linode.id)
    );

    const payload: UnassignLinodesFromPlacementGroupPayload = {
      linodes: [linode.id],
    };

    try {
      unassignLinodes(payload);
    } catch (error) {
      setGeneralError(
        error
          ? error?.[0]?.reason
          : 'An error occurred while removing the Linode from the group'
      );
    }
  };

  return (
    <Drawer onClose={onClose} open={open} title={drawerTitle}>
      <Grid>
        {generalError ? <Notice text={generalError} variant="error" /> : null}
        <form onSubmit={handleAssignLinode}>
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
              options={getLinodeSelectOptions()}
              value={selectedLinode?.id ?? null}
            />

            <ActionsPanel
              primaryButtonProps={{
                'data-testid': 'submit',
                disabled: !selectedLinode,
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
              onRemove={(data: Linode) => {
                handleUnassignLinode(data);
              }}
              headerText={`Linodes Assigned to Placement Group`}
              noDataText={'No Linodes have been assigned.'}
              preferredDataLabel="linodeConfigLabel"
              selectionData={localLinodesSelection}
            />
            <ActionsPanel
              primaryButtonProps={{
                label: 'Done',
                onClick: onClose,
              }}
              sx={{ pt: 2 }}
            />
          </Stack>
        </form>
      </Grid>
    </Drawer>
  );
};

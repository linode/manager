import { AFFINITY_TYPES } from '@linode/api-v4';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Box } from 'src/components/Box';
import { Divider } from 'src/components/Divider';
import { Drawer } from 'src/components/Drawer';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { Stack } from 'src/components/Stack';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { Typography } from 'src/components/Typography';
import { usePlacementGroupData } from 'src/hooks/usePlacementGroupsData';
import { useAllLinodesQuery } from 'src/queries/linodes/linodes';
import {
  useAssignLinodesToPlacementGroup,
  useUnpaginatedPlacementGroupsQuery,
} from 'src/queries/placementGroups';

import { LinodeSelect } from '../Linodes/LinodeSelect/LinodeSelect';
import {
  getAffinityEnforcement,
  getLinodesFromAllPlacementGroups,
} from './utils';

import type { PlacementGroupsAssignLinodesDrawerProps } from './types';
import type {
  AssignLinodesToPlacementGroupPayload,
  Linode,
} from '@linode/api-v4';

export const PlacementGroupsAssignLinodesDrawer = (
  props: PlacementGroupsAssignLinodesDrawerProps
) => {
  const { onClose, open, selectedPlacementGroup } = props;
  const { data: allLinodesInRegion, error: linodesError } = useAllLinodesQuery(
    {},
    {
      '+or': [
        {
          region: selectedPlacementGroup?.region,
        },
      ],
    },
    open
  );
  const {
    data: allPlacementGroups,
    error: allPlacementGroupsError,
  } = useUnpaginatedPlacementGroupsQuery();

  // We display a notice and disable inputs in case the user reaches this drawer somehow
  // (not supposed to happen as the "Assign Linode to Placement Group" button should be disabled
  const { hasReachedCapacity, region } = usePlacementGroupData({
    placementGroup: selectedPlacementGroup,
  });
  const { mutateAsync: assignLinodes } = useAssignLinodesToPlacementGroup(
    selectedPlacementGroup?.id ?? -1
  );
  const [selectedLinode, setSelectedLinode] = React.useState<Linode | null>(
    null
  );
  const [generalError, setGeneralError] = React.useState<string | undefined>(
    undefined
  );

  const handleResetForm = () => {
    setSelectedLinode(null);
    setGeneralError(undefined);
  };

  const handleDrawerClose = () => {
    onClose();
    handleResetForm();
  };

  const linodesFromAllPlacementGroups = getLinodesFromAllPlacementGroups(
    allPlacementGroups
  );

  if (
    !allLinodesInRegion ||
    !selectedPlacementGroup ||
    linodesError ||
    allPlacementGroupsError
  ) {
    return (
      <ErrorState errorText="There was a problem retrieving your placement group. Please try again" />
    );
  }

  const getLinodeSelectOptions = (): Linode[] => {
    return allLinodesInRegion.filter((linode) => {
      return !linodesFromAllPlacementGroups.includes(linode.id);
    });
  };

  const { affinity_type, label } = selectedPlacementGroup;
  const linodeSelectLabel = region
    ? `Linodes in ${region.label} (${region.id})`
    : 'Linodes';

  const drawerTitle =
    label && affinity_type
      ? `Assign Linodes to Placement Group ${label} (${AFFINITY_TYPES[affinity_type]})`
      : 'Assign Linodes to Placement Group';

  const handleAssignLinode = async (e: React.SyntheticEvent<HTMLElement>) => {
    e.preventDefault();
    setSelectedLinode(null);

    if (!selectedLinode) {
      return;
    }

    const payload: AssignLinodesToPlacementGroupPayload = {
      linodes: [selectedLinode.id],
    };

    try {
      await assignLinodes(payload);
      handleDrawerClose();
    } catch (error) {
      setGeneralError(
        error?.[0]?.reason
          ? error[0].reason
          : 'An error occurred while assigning the Linode to the group'
      );
    }
  };

  return (
    <Drawer onClose={handleDrawerClose} open={open} title={drawerTitle}>
      <Grid>
        {generalError ? <Notice text={generalError} variant="error" /> : null}
        <Typography my={4}>
          <strong>Affinity Enforcement: </strong>
          {getAffinityEnforcement(selectedPlacementGroup.is_strict)}
        </Typography>
        <Divider sx={{ mb: 4 }} />
        <form onSubmit={handleAssignLinode}>
          <Stack spacing={1}>
            {hasReachedCapacity && open && (
              <Notice
                text="This Placement Group has the maximum number of Linodes allowed"
                variant="error"
              />
            )}
            <Typography>
              A Linode can only be assigned to a single Placement Group.
            </Typography>

            <Typography>
              If you need to create a new Linode, go to{' '}
              <Link to="/linodes/create">Create Linode</Link> and return to this
              page to assign it to this Placement Group.
            </Typography>
            <Box sx={{ alignItems: 'flex-end', display: 'flex' }}>
              <LinodeSelect
                onSelectionChange={(value) => {
                  setSelectedLinode(value);
                }}
                disabled={hasReachedCapacity}
                label={linodeSelectLabel}
                options={getLinodeSelectOptions()}
                placeholder="Select Linode or type to search"
                sx={{ flexGrow: 1 }}
                value={selectedLinode?.id ?? null}
              />
              <TooltipIcon
                placement="right"
                status="help"
                sxTooltipIcon={{ position: 'relative', top: 4 }}
                text="Only displaying Linodes that aren’t assigned to a Placement Group"
              />
            </Box>

            <ActionsPanel
              primaryButtonProps={{
                'data-testid': 'submit',
                disabled: !selectedLinode || hasReachedCapacity,
                label: 'Assign Linode',
                type: 'submit',
              }}
              sx={{ pt: 2 }}
            />
          </Stack>
        </form>
      </Grid>
    </Drawer>
  );
};

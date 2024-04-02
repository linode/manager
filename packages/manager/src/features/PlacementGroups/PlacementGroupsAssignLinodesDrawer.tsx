import { AFFINITY_TYPES } from '@linode/api-v4';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Box } from 'src/components/Box';
import { Divider } from 'src/components/Divider';
import { Drawer } from 'src/components/Drawer';
import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { Stack } from 'src/components/Stack';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { Typography } from 'src/components/Typography';
import { useAllLinodesQuery } from 'src/queries/linodes/linodes';
import {
  useAllPlacementGroupsQuery,
  useAssignLinodesToPlacementGroup,
} from 'src/queries/placementGroups';

import { LinodeSelect } from '../Linodes/LinodeSelect/LinodeSelect';
import {
  getAffinityTypeEnforcement,
  getLinodesFromAllPlacementGroups,
  hasPlacementGroupReachedCapacity,
} from './utils';

import type { PlacementGroupsAssignLinodesDrawerProps } from './types';
import type {
  AssignLinodesToPlacementGroupPayload,
  Linode,
} from '@linode/api-v4';

export const PlacementGroupsAssignLinodesDrawer = (
  props: PlacementGroupsAssignLinodesDrawerProps
) => {
  const { onClose, open, region, selectedPlacementGroup } = props;
  const { data: allLinodesInRegion, error: linodesError } = useAllLinodesQuery(
    {},
    {
      region: selectedPlacementGroup?.region,
    }
  );
  const {
    data: allPlacementGroups,
    error: allPlacementGroupsError,
  } = useAllPlacementGroupsQuery();
  const { enqueueSnackbar } = useSnackbar();

  // We display a notice and disable inputs in case the user reaches this drawer somehow
  // (not supposed to happen as the "Assign Linode to Placement Group" button should be disabled)
  const hasReachedCapacity = hasPlacementGroupReachedCapacity({
    placementGroup: selectedPlacementGroup,
    region,
  });
  const {
    isLoading,
    mutateAsync: assignLinodes,
  } = useAssignLinodesToPlacementGroup(selectedPlacementGroup?.id ?? -1);
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

  const getLinodeSelectOptions = (): Linode[] => {
    // We filter out Linodes that are already assigned to a Placement Group
    return (
      allLinodesInRegion?.filter((linode) => {
        return !linodesFromAllPlacementGroups.includes(linode.id);
      }) ?? []
    );
  };

  if (
    !allLinodesInRegion ||
    !selectedPlacementGroup ||
    linodesError ||
    allPlacementGroupsError
  ) {
    return null;
  }

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

    // Since we allow only one Linode to be assigned to a Placement Group,
    // We're using a tuple with the selected Linode ID
    const payload: AssignLinodesToPlacementGroupPayload = {
      linodes: [selectedLinode.id],
    };

    try {
      await assignLinodes(payload);
      const toastMessage = 'Linode successfully assigned';
      enqueueSnackbar(toastMessage, {
        variant: 'success',
      });
      handleDrawerClose();
    } catch (error) {
      setGeneralError(
        error?.[0]?.reason
          ? error[0].reason
          : 'An error occurred while adding the Linode to the group'
      );
      enqueueSnackbar(error[0]?.reason, { variant: 'error' });
    }
  };

  return (
    <Drawer onClose={handleDrawerClose} open={open} title={drawerTitle}>
      {generalError ? <Notice text={generalError} variant="error" /> : null}
      <Typography my={4}>
        <strong>Affinity Enforcement: </strong>
        {getAffinityTypeEnforcement(selectedPlacementGroup.is_strict)}
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
              checkIsOptionEqualToValue
              disabled={hasReachedCapacity || isLoading}
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
            secondaryButtonProps={{
              'data-testid': 'cancel',
              label: 'Cancel',
              onClick: handleDrawerClose,
            }}
            sx={{ pt: 2 }}
          />
        </Stack>
      </form>
    </Drawer>
  );
};

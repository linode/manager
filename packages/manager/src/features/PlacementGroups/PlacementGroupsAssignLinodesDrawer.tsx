import {
  PLACEMENT_GROUP_POLICIES,
  PLACEMENT_GROUP_TYPES,
} from '@linode/api-v4';
import {
  useAllLinodesQuery,
  useAllPlacementGroupsQuery,
  useAssignLinodesToPlacementGroup,
} from '@linode/queries';
import { LinodeSelect } from '@linode/shared';
import {
  ActionsPanel,
  Box,
  Divider,
  Notice,
  Stack,
  TooltipIcon,
  Typography,
} from '@linode/ui';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { DescriptionList } from 'src/components/DescriptionList/DescriptionList';
import { Drawer } from 'src/components/Drawer';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';

import {
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
  } = useAllPlacementGroupsQuery({});
  const { enqueueSnackbar } = useSnackbar();

  // We display a notice and disable inputs in case the user reaches this drawer somehow
  // (not supposed to happen as the "Assign Linode to Placement Group" button should be disabled)
  const hasReachedCapacity = hasPlacementGroupReachedCapacity({
    placementGroup: selectedPlacementGroup,
    region,
  });
  const {
    isPending,
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

  const {
    label,
    placement_group_policy,
    placement_group_type,
  } = selectedPlacementGroup;
  const linodeSelectLabel = region
    ? `Linodes in ${region.label} (${region.id})`
    : 'Linodes';

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
      const toastMessage = `Linode ${selectedLinode.label} successfully assigned.`;
      enqueueSnackbar(toastMessage, {
        variant: 'success',
      });
      handleDrawerClose();
    } catch (errorResponse) {
      const error = getErrorStringOrDefault(
        errorResponse,
        'An error occurred while adding the Linode to the group.'
      );
      setGeneralError(error);
      enqueueSnackbar(error, { variant: 'error' });
    }
  };

  return (
    <Drawer
      onClose={handleDrawerClose}
      open={open}
      title={`Assign Linodes to Placement Group ${label}`}
    >
      {generalError ? <Notice text={generalError} variant="error" /> : null}
      <DescriptionList
        items={[
          {
            description: PLACEMENT_GROUP_TYPES[placement_group_type],
            title: 'Placement Group Type',
          },
          {
            description: PLACEMENT_GROUP_POLICIES[placement_group_policy],
            title: 'Placement Group Policy',
          },
        ]}
        sx={{ my: 2 }}
      />
      <Divider sx={{ mb: 3 }} />
      <form onSubmit={handleAssignLinode}>
        <Stack spacing={1}>
          {hasReachedCapacity && open && (
            <Notice
              text="This Placement Group has the maximum number of Linodes allowed"
              variant="error"
            />
          )}
          <Typography>
            A Linode can only be assigned to one placement group.
          </Typography>
          <Box sx={{ alignItems: 'flex-end', display: 'flex' }}>
            <LinodeSelect
              onSelectionChange={(value) => {
                setSelectedLinode(value);
              }}
              checkIsOptionEqualToValue
              disabled={hasReachedCapacity || isPending}
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
              text="Only displaying Linodes that aren’t assigned to a Placement Group."
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

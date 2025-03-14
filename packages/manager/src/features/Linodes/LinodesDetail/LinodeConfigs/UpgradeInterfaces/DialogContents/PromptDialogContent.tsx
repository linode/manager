import {
  useAllLinodeConfigsQuery,
  useUpgradeToLinodeInterfacesMutation,
} from '@linode/queries';
import {
  Box,
  Button,
  CircleProgress,
  List,
  ListItem,
  Stack,
  Typography,
} from '@linode/ui';
import React from 'react';

import type {
  PromptDialogState,
  UpgradeInterfacesDialogContentProps,
} from '../types';

export const PromptDialogContent = (
  props: UpgradeInterfacesDialogContentProps<PromptDialogState>
) => {
  const { linodeId, onClose, open, setDialogState } = props;

  const [isDryRun, setIsDryRun] = React.useState<boolean>(true);

  const {
    data: configs,
    isLoading: isLoadingConfigs,
  } = useAllLinodeConfigsQuery(linodeId, open);

  const {
    isPending,
    mutateAsync: upgradeInterfaces,
  } = useUpgradeToLinodeInterfacesMutation(linodeId);

  if (isLoadingConfigs) {
    return <CircleProgress />;
  }

  const isPendingDryRun = isPending && isDryRun;
  const isPendingUpgrade = isPending && !isDryRun;

  const upgradeSingleConfig = async (
    isDryRun: boolean,
    dialogTitle: string
  ) => {
    setIsDryRun(isDryRun);

    try {
      const returnedData = await upgradeInterfaces({
        dry_run: isDryRun,
      });
      setDialogState({
        dialogTitle,
        isDryRun,
        linodeInterfaces: returnedData.interfaces,
        step: 'success',
      });
    } catch (errors) {
      setDialogState({
        dialogTitle,
        errors,
        isDryRun,
        step: 'error',
      });
    }
  };

  const upgradeDryRun =
    configs && configs.length > 1
      ? () =>
          setDialogState({
            configs,
            dialogTitle: 'Upgrade Dry Run',
            isDryRun: true,
            step: 'configSelect',
          })
      : () => upgradeSingleConfig(true, `Dry Run: ${configs?.[0].label}`);
  const upgradeToLinodeInterfaces =
    configs && configs?.length > 1
      ? () =>
          setDialogState({
            configs,
            dialogTitle: 'Upgrade Interfaces',
            isDryRun: false,
            step: 'configSelect',
          })
      : () =>
          upgradeSingleConfig(
            false,
            `Upgrade Interfaces: ${configs?.[0].label}`
          );

  return (
    <Stack gap={2}>
      <Typography>
        Upgrading allows interface connections to be directly associated with
        the Linode and not the Linode&apos;s configuration profile.
      </Typography>
      <Typography>
        It is recommended that you perform a dry run before upgrading to verify
        and resolve potential conflicts during the upgrade.
      </Typography>
      <Typography>
        <strong>Upgrading will have the following impact:</strong>
      </Typography>
      <List dense sx={{ listStyleType: 'disc', pl: 3 }}>
        <ListItem disablePadding sx={{ display: 'list-item' }}>
          Any firewall attached to the Linode will be removed and a default
          firewall will be attached to the new interface automatically.
        </ListItem>
        <ListItem disablePadding sx={{ display: 'list-item' }}>
          If a firewall is not currently assigned, one will be added during the
          upgrade to improve security.
        </ListItem>{' '}
        <ListItem disablePadding sx={{ display: 'list-item' }}>
          All networking configurations will be deleted from the configuration
          profile and re-assigned to the neew interfaces in the Linode Network
          tab.
        </ListItem>
      </List>
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          justifyContent: 'flex-end',
        }}
      >
        <Button buttonType="secondary" disabled={isPending} onClick={onClose}>
          Cancel
        </Button>
        <Button
          buttonType="outlined"
          disabled={isPendingUpgrade}
          loading={isPendingDryRun}
          onClick={upgradeDryRun}
        >
          Upgrade Dry Run
        </Button>
        <Button
          buttonType="primary"
          disabled={isPendingDryRun}
          loading={isPendingUpgrade}
          onClick={upgradeToLinodeInterfaces}
        >
          Upgrade Interfaces
        </Button>
      </Box>
    </Stack>
  );
};

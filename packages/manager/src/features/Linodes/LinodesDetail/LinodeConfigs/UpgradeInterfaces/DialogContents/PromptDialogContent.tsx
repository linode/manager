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

import { useAllLinodeConfigsQuery } from 'src/queries/linodes/configs';

import { useUpgradeToLinodeInterfaces } from '../useUpgradeToLinodeInterfaces';

import type {
  PromptDialogState,
  UpgradeInterfacesDialogContentProps,
} from '../types';

export const PromptDialogContent = (
  props: UpgradeInterfacesDialogContentProps<PromptDialogState>
) => {
  const { linodeId, onClose, open, setDialogState } = props;

  const { data: configs, isLoading } = useAllLinodeConfigsQuery(linodeId, open);

  const { upgradeToLinodeInterfaces } = useUpgradeToLinodeInterfaces({
    linodeId,
    selectedConfig: configs?.[0],
    setDialogState,
  });

  if (isLoading) {
    return <CircleProgress />;
  }

  const upgradeDryRun =
    configs && configs.length > 1
      ? () =>
          setDialogState({
            configs,
            dialogTitle: 'Upgrade Dry Run',
            isDryRun: true,
            step: 'configSelect',
          })
      : () => upgradeToLinodeInterfaces(true);
  const upgradeInterfaces =
    configs && configs?.length > 1
      ? () =>
          setDialogState({
            configs,
            dialogTitle: 'Upgrade Interfaces',
            isDryRun: false,
            step: 'configSelect',
          })
      : () => upgradeToLinodeInterfaces(false);

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
        <Button buttonType="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button buttonType="outlined" onClick={upgradeDryRun}>
          Upgrade Dry Run
        </Button>
        <Button buttonType="primary" onClick={upgradeInterfaces}>
          Upgrade Interfaces
        </Button>
      </Box>
    </Stack>
  );
};

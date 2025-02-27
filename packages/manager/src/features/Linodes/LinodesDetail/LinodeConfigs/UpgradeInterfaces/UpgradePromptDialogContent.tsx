import { Box, Button, List, ListItem, Stack, Typography } from '@linode/ui';
import React from 'react';

import { useAllLinodeConfigsQuery } from 'src/queries/linodes/configs';

import type {
  PromptDialogState,
  UpgradeInterfacesDialogContentProps,
} from './types';

export const UpgradePromptDialogContent = (
  props: UpgradeInterfacesDialogContentProps<PromptDialogState>
) => {
  const { linodeId, onClose, open, setDialogState, state } = props;

  const { data: configs } = useAllLinodeConfigsQuery(linodeId, open);

  if (!configs) {
    return <Typography>No Configuration Profiles found to upgrade.</Typography>;
  }

  const upgradeDryRun =
    configs?.length > 1
      ? () =>
          setDialogState({
            configs,
            dialogTitle: 'Upgrade Dry Run',
            isDryRun: true,
            step: 'configSelect',
          })
      : () => {};
  const upgradeInterfaces =
    configs?.length > 1
      ? () =>
          setDialogState({
            configs,
            dialogTitle: 'Upgrade Interfaces',
            isDryRun: false,
            step: 'configSelect',
          })
      : () => {};

  return (
    <Stack gap={2}>
      <Typography>
        Upgrading allows interface connections to be directly associated with
        the Linode and not the Linode's configuration profile.
      </Typography>
      <Typography>
        It is recommended that you perform a dry run before upgrading to verify
        and resolve potential conflicts during the upgrade.
      </Typography>
      <Typography>Upgrading will have the following impact:</Typography>
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
      <Box gap={2}>
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

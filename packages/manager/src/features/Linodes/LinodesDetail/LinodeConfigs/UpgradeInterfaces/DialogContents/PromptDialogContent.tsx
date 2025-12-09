import { useAllLinodeConfigsQuery } from '@linode/queries';
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

import { useUpgradeToLinodeInterfaces } from '../useUpgradeToLinodeInterfaces';

import type {
  PromptDialogState,
  UpgradeInterfacesDialogContentProps,
} from '../types';

const upgradingImpacts = [
  'New Linode Interfaces are created to match the existing Configuration Profile Interfaces.',
  'The Linode will only use Linode Interfaces and cannot revert to Configuration Profile Interfaces.',
  'Private IPv4 addresses are not supported on public Linode Interfaces—services relying on a private IPv4 will no longer function.',
  'All firewalls are removed from the Linode. Any previously attached firewalls are reassigned to the new public and VPC interfaces. Default firewalls are not applied if none were originally attached.',
  'Public interfaces retain the Linode’s existing MAC address and SLAAC IPv6 address.',
  'Configuration Profile Interfaces are removed from the Configurations tab. The new Linode Interfaces will appear in the Network tab.',
];

export const PromptDialogContent = (
  props: UpgradeInterfacesDialogContentProps<PromptDialogState>
) => {
  const { linodeId, onClose, open, setDialogState } = props;

  const [isDryRun, setIsDryRun] = React.useState<boolean>(true);

  const { data: configs, isLoading: isLoadingConfigs } =
    useAllLinodeConfigsQuery(linodeId, open);

  const { isPending, upgradeToLinodeInterfaces } = useUpgradeToLinodeInterfaces(
    {
      linodeId,
      selectedConfig: configs?.[0],
      setDialogState,
    }
  );

  if (isLoadingConfigs) {
    return <CircleProgress />;
  }

  const isPendingDryRun = isPending && isDryRun;
  const isPendingUpgrade = isPending && !isDryRun;

  const upgradeDryRun =
    configs && configs.length > 1
      ? () =>
          setDialogState({
            configs,
            dialogTitle: 'Upgrade Dry Run',
            isDryRun: true,
            step: 'configSelect',
          })
      : () => {
          setIsDryRun(true);
          upgradeToLinodeInterfaces(true);
        };
  const upgradeInterfaces =
    configs && configs?.length > 1
      ? () =>
          setDialogState({
            configs,
            dialogTitle: 'Upgrade Interfaces',
            isDryRun: false,
            step: 'configSelect',
          })
      : () => {
          setIsDryRun(false);
          upgradeToLinodeInterfaces(false);
        };

  return (
    <Stack gap={2}>
      <Typography>
        Upgrading allows interface connections to be associated directly with
        the Linode, rather than its configuration profile.
      </Typography>
      <Typography>
        We recommend performing a dry run before upgrading to identify and
        resolve any potential conflicts.
      </Typography>
      <Typography>
        <strong>What happens after the upgrade:</strong>
      </Typography>
      <List dense sx={{ listStyleType: 'disc', pl: 3 }}>
        {upgradingImpacts.map((copy, idx) => (
          <ListItem disablePadding key={idx} sx={{ display: 'list-item' }}>
            {copy}
          </ListItem>
        ))}
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
          Perform Dry Run
        </Button>
        <Button
          buttonType="primary"
          disabled={isPendingDryRun}
          loading={isPendingUpgrade}
          onClick={upgradeInterfaces}
        >
          Upgrade Interfaces
        </Button>
      </Box>
    </Stack>
  );
};

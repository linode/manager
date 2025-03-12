import { Button, Notice, Stack, Typography } from '@linode/ui';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { VolumeUpgradeCopy } from 'src/features/Volumes/Dialogs/UpgradeVolumeDialog';
import { getUpgradeableVolumeIds } from 'src/features/Volumes/utils';
import { useNotificationsQuery } from '@linode/queries';
import {
  useLinodeVolumesQuery,
  useVolumesMigrateMutation,
} from 'src/queries/volumes/volumes';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import type { Linode } from '@linode/api-v4';

interface Props {
  linode: Linode;
  onClose: () => void;
  open: boolean;
}

export const UpgradeVolumesDialog = (props: Props) => {
  const { linode, onClose, open } = props;
  const { enqueueSnackbar } = useSnackbar();

  const {
    error,
    isPending,
    mutateAsync: migrateVolumes,
  } = useVolumesMigrateMutation();

  const { data: volumesData } = useLinodeVolumesQuery(linode.id);
  const { data: notifications } = useNotificationsQuery();

  const volumeIdsEligibleForUpgrade = getUpgradeableVolumeIds(
    volumesData?.data ?? [],
    notifications ?? []
  );

  const numUpgradeableVolumes = volumeIdsEligibleForUpgrade.length;

  const onSubmit = () => {
    migrateVolumes(volumeIdsEligibleForUpgrade).then(() => {
      enqueueSnackbar(
        `Successfully added ${linode.label}\u{2019}s volumes to the migration queue.`,
        { variant: 'success' }
      );
      onClose();
    });
  };

  const actions = (
    <Stack direction="row" justifyContent="flex-end" spacing={2}>
      <Button buttonType="secondary" onClick={onClose}>
        Cancel
      </Button>
      <Button buttonType="primary" loading={isPending} onClick={onSubmit}>
        Enter Upgrade Queue
      </Button>
    </Stack>
  );

  return (
    <ConfirmationDialog
      error={
        error
          ? getAPIErrorOrDefault(error, 'Unable to migrate volumes.')[0].reason
          : undefined
      }
      actions={actions}
      onClose={onClose}
      open={open}
      title={`Upgrade Volume${numUpgradeableVolumes === 1 ? '' : 's'}`}
    >
      <Stack spacing={2}>
        <VolumeUpgradeCopy
          isManyVolumes={numUpgradeableVolumes > 1}
          label={linode.label}
          type="linode"
        />
        <Notice variant="warning">
          <Typography>
            As part of the upgrade process, this Linode may be rebooted and will
            be returned to its last known state prior to the upgrade.
          </Typography>
        </Notice>
      </Stack>
    </ConfirmationDialog>
  );
};

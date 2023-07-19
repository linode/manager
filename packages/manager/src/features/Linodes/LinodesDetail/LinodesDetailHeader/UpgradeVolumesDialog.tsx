import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { useQueryClient } from 'react-query';

import ActionsPanel from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Typography } from 'src/components/Typography';
import Paper from 'src/components/core/Paper';
import { VolumeUpgradeCopy } from 'src/features/Volumes/UpgradeVolumeDialog';
import { queryKey } from 'src/queries/accountNotifications';
import { useVolumesMigrateMutation } from 'src/queries/volumesMigrations';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import { ExtendedLinode } from '../types';

interface Props {
  linode: ExtendedLinode;
  onClose: () => void;
  open: boolean;
  upgradeableVolumeIds: number[];
}

const useStyles = makeStyles((theme: Theme) => ({
  notice: {
    borderLeft: `solid 6px ${theme.color.yellow}`,
    marginTop: theme.spacing(2),
    padding: theme.spacing(),
  },
}));

export const UpgradeVolumesDialog = (props: Props) => {
  const { linode, onClose, open, upgradeableVolumeIds } = props;
  const { enqueueSnackbar } = useSnackbar();
  const classes = useStyles();
  const queryClient = useQueryClient();

  const {
    error,
    isLoading,
    mutateAsync: migrateVolumes,
  } = useVolumesMigrateMutation();

  const numUpgradeableVolumes = upgradeableVolumeIds.length;

  const onSubmit = () => {
    migrateVolumes(upgradeableVolumeIds).then(() => {
      enqueueSnackbar(
        `Successfully added ${linode.label}\u{2019}s volumes to the migration queue.`,
        { variant: 'success' }
      );
      // Re-request notifications so the Upgrade Volume banner on the Linode Detail page disappears.
      queryClient.invalidateQueries(queryKey);
      onClose();
    });
  };

  const actions = (
    <ActionsPanel
      primaryButtonHandler={onSubmit}
      primaryButtonLoading={isLoading}
      primaryButtonText="Enter Upgrade Queue"
      secondaryButtonHandler={onClose}
      secondaryButtonText="Cancel"
      showPrimary
      showSecondary
    />
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
      <Typography>
        <VolumeUpgradeCopy
          isManyVolumes={numUpgradeableVolumes > 1}
          label={linode.label}
          type="linode"
        />
        <Paper className={classes.notice}>
          As part of the upgrade process, this Linode may be rebooted and will
          be returned to its last known state prior to the upgrade.
        </Paper>
      </Typography>
    </ConfirmationDialog>
  );
};

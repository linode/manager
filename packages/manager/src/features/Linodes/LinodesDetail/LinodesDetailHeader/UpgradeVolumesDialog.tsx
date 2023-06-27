import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import Paper from 'src/components/core/Paper';
import Typography from 'src/components/core/Typography';
import { useSnackbar } from 'notistack';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import { VolumeUpgradeCopy } from 'src/features/Volumes/UpgradeVolumeDialog';
import { useVolumesMigrateMutation } from 'src/queries/volumesMigrations';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { ExtendedLinode } from '../types';
import { useQueryClient } from 'react-query';
import { queryKey } from 'src/queries/accountNotifications';

interface Props {
  open: boolean;
  onClose: () => void;
  linode: ExtendedLinode;
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
  const { open, onClose, linode, upgradeableVolumeIds } = props;
  const { enqueueSnackbar } = useSnackbar();
  const classes = useStyles();
  const queryClient = useQueryClient();

  const {
    mutateAsync: migrateVolumes,
    isLoading,
    error,
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
    <ActionsPanel>
      <Button buttonType="secondary" onClick={onClose}>
        Cancel
      </Button>
      <Button buttonType="primary" onClick={onSubmit} loading={isLoading}>
        Enter Upgrade Queue
      </Button>
    </ActionsPanel>
  );

  return (
    <ConfirmationDialog
      title={`Upgrade Volume${numUpgradeableVolumes === 1 ? '' : 's'}`}
      open={open}
      onClose={onClose}
      actions={actions}
      error={
        error
          ? getAPIErrorOrDefault(error, 'Unable to migrate volumes.')[0].reason
          : undefined
      }
    >
      <Typography>
        <VolumeUpgradeCopy
          type="linode"
          label={linode.label}
          isManyVolumes={numUpgradeableVolumes > 1}
        />
        <Paper className={classes.notice}>
          As part of the upgrade process, this Linode may be rebooted and will
          be returned to its last known state prior to the upgrade.
        </Paper>
      </Typography>
    </ConfirmationDialog>
  );
};

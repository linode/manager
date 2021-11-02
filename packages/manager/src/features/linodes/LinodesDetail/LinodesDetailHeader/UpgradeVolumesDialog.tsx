import { useSnackbar } from 'notistack';
import * as React from 'react';
import { useDispatch } from 'react-redux';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Dialog from 'src/components/ConfirmationDialog';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Link from 'src/components/Link';
import { Dispatch } from 'src/hooks/types';
import { useVolumesMigrateMutation } from 'src/queries/volumesMigrations';
import { requestNotifications } from 'src/store/notification/notification.requests';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { ExtendedLinode } from '../types';

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

export const UpgradeVolumesDialog: React.FC<Props> = (props) => {
  const { open, onClose, linode, upgradeableVolumeIds } = props;
  const { enqueueSnackbar } = useSnackbar();
  const classes = useStyles();

  const dispatch: Dispatch = useDispatch();

  const {
    mutateAsync: migrateVolumes,
    isLoading,
    error,
  } = useVolumesMigrateMutation();

  const numUpgradeableVolumes = upgradeableVolumeIds.length;

  const onSubmit = () => {
    migrateVolumes(upgradeableVolumeIds).then(() => {
      enqueueSnackbar(
        `Successfully added ${linode.label}'s volumes to the migration queue.`,
        { variant: 'success' }
      );
      // Re-request notifications so the Upgrade Volume banner on the Linode Detail page disappears.
      dispatch(requestNotifications());
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
    <Dialog
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
        {numUpgradeableVolumes === 1
          ? 'A Volume attached to Linode '
          : 'Volumes attached to '}
        {linode.label} will be upgraded to high-performance NVMe Block Storage.
        This is a free upgrade and will not incur any additional service
        charges. Check upgrade eligibility or current status of Volumes on the{' '}
        <Link to="/account/maintenance">Maintenance Page</Link>.
        <Paper className={classes.notice}>
          As part of the upgrade process, this Linode may be rebooted and will
          be returned to its last known state prior to the upgrade.
        </Paper>
      </Typography>
    </Dialog>
  );
};

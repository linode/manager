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
import {
  useVolumesMigrateMutation,
  useVolumesMigrationQueueQuery,
} from 'src/queries/volumesMigrations';
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
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    padding: theme.spacing(1),
    borderLeft: `solid 6px ${theme.color.yellow}`,
  },
}));

export const UpgradeVolumesDialog: React.FC<Props> = (props) => {
  const { open, onClose, linode, upgradeableVolumeIds } = props;
  const { enqueueSnackbar } = useSnackbar();
  const classes = useStyles();

  const dispatch: Dispatch = useDispatch();

  const { data: migrationQueue } = useVolumesMigrationQueueQuery(
    linode.region,
    open
  );

  const {
    mutateAsync: migrateVolumes,
    isLoading,
    error,
  } = useVolumesMigrateMutation();

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
      title="Upgrade Volumes"
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
        All Volumes attached to Linode {linode.label} will be upgraded to
        high-performance{' '}
        <Link to="https://www.linode.com/products/block-storage/">
          NVMe block storage
        </Link>
        .
        <Paper className={classes.notice}>
          This Linode will be rebooted as part of the upgrade process.
        </Paper>
        There are currently {migrationQueue?.linodes || 0} Linodes in the
        migration queue.
      </Typography>
    </Dialog>
  );
};

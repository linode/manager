import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Dialog from 'src/components/ConfirmationDialog';
import Paper from 'src/components/core/Paper';
import Link from 'src/components/Link';
import { makeStyles, Theme } from 'src/components/core/styles';
import { ExtendedLinode } from '../types';
import { Volume } from '@linode/api-v4/lib/volumes/types';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { useSnackbar } from 'notistack';
import {
  useVolumesMigrateMutation,
  useVolumesMigrationQueueQuery,
} from 'src/queries/volumesMigrations';

interface Props {
  open: boolean;
  onClose: () => void;
  linode: ExtendedLinode;
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
  const { open, onClose, linode } = props;
  const classes = useStyles();
  // @TODO make sure the extended Linode passed as a prop updates with fresh data if volumes were to change
  const volumes = linode._volumes;
  const { enqueueSnackbar } = useSnackbar();

  const { data: migrationQueue } = useVolumesMigrationQueueQuery(linode.region);
  const {
    mutateAsync: migrateVolumes,
    isLoading,
    error,
  } = useVolumesMigrateMutation();

  const onSubmit = () => {
    // @TODO what Volume IDs will we want to pass? What filtering will we need to do?
    const hddVolumes = volumes.filter(
      // @ts-expect-error types will be ok after https://github.com/linode/manager/pull/7964 is intergrated
      (volume: Volume) => volume.hardware_type === 'hdd'
    );
    const volumeIds = hddVolumes.map((volume: Volume) => volume.id);

    migrateVolumes(volumeIds).then(() => {
      enqueueSnackbar(
        `Successfully added ${linode.label}'s volumes to the migration queue.`,
        { variant: 'success' }
      );
      onClose();
    });
  };

  const actions = (
    <ActionsPanel>
      <Button buttonType="secondary" onClick={onClose}>
        Cancel
      </Button>
      <Button buttonType="primary" onClick={onSubmit} loading={isLoading}>
        Enter Migration Queue
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
      All Volumes attached to Linode <b>{linode.label}</b> will be upgraded to
      high-performance{' '}
      <Link to="https://www.linode.com/products/block-storage/">
        NVMe block storage
      </Link>
      .
      <Paper className={classes.notice}>
        The Linode will be rebooted as part of the upgrade process.
      </Paper>
      There are <b>{migrationQueue?.linodes || 0}</b> Linodes in the migration
      queue.
    </Dialog>
  );
};

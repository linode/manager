import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Dialog from 'src/components/ConfirmationDialog';
import Typography from 'src/components/core/Typography';
import Link from 'src/components/Link';
import { useVolumesMigrateMutation } from 'src/queries/volumesMigrations';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { useSnackbar } from 'notistack';

interface Props {
  open: boolean;
  onClose: () => void;
  id: number;
  label: string;
}

export const UpgradeVolumeDialog: React.FC<Props> = (props) => {
  const { open, onClose, id, label } = props;
  const { enqueueSnackbar } = useSnackbar();

  const {
    mutateAsync: migrateVolumes,
    isLoading,
    error,
  } = useVolumesMigrateMutation();

  const onSubmit = () => {
    migrateVolumes([id]).then(() => {
      enqueueSnackbar(`Successfully added ${label} to the migration queue.`, {
        variant: 'success',
      });
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
      title={`Upgrade Volume ${label}`}
      open={open}
      onClose={onClose}
      actions={actions}
      error={
        error
          ? getAPIErrorOrDefault(error, 'Unable to migrate volume.')[0].reason
          : undefined
      }
    >
      <Typography>
        Volume {label} will be upgraded to high-performance NVMe Block Storage.
        This is a free upgrade and will not incur any additional service
        charges. Check upgrade eligibility or current status of Volumes on the{' '}
        <Link to="/account/maintenance">Maintenance Page</Link>.
      </Typography>
    </Dialog>
  );
};

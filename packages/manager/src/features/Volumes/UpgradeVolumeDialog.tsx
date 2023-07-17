import { useSnackbar } from 'notistack';
import * as React from 'react';

import ActionsPanel from 'src/components/ActionsPanel';
import { Button } from 'src/components/Button/Button';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Link } from 'src/components/Link';
import { Typography } from 'src/components/Typography';
import { useVolumesMigrateMutation } from 'src/queries/volumesMigrations';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

interface CopyProps {
  isManyVolumes?: boolean;
  label: string;
  type: 'linode' | 'volume';
}

export const VolumeUpgradeCopy = (props: CopyProps) => {
  const { isManyVolumes, label, type } = props;

  const prefix =
    type === 'linode'
      ? isManyVolumes
        ? `Volumes attached to ${label}`
        : `A Volume attached to Linode ${label}`
      : `Volume ${label}`;

  return (
    <Typography>
      {prefix} will be upgraded to high-performance NVMe Block Storage. This is
      a free upgrade and will not incur any additional service charges. Check
      upgrade eligibility or current status of Volumes on the{' '}
      <Link to="/account/maintenance">Maintenance Page</Link>.
    </Typography>
  );
};

interface Props {
  id: number;
  label: string;
  onClose: () => void;
  open: boolean;
}

export const UpgradeVolumeDialog: React.FC<Props> = (props) => {
  const { id, label, onClose, open } = props;
  const { enqueueSnackbar } = useSnackbar();

  const {
    error,
    isLoading,
    mutateAsync: migrateVolumes,
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
      <Button buttonType="primary" loading={isLoading} onClick={onSubmit}>
        Enter Upgrade Queue
      </Button>
    </ActionsPanel>
  );

  return (
    <ConfirmationDialog
      error={
        error
          ? getAPIErrorOrDefault(error, 'Unable to migrate volume.')[0].reason
          : undefined
      }
      actions={actions}
      onClose={onClose}
      open={open}
      title={`Upgrade Volume ${label}`}
    >
      <VolumeUpgradeCopy label={label} type="volume" />
    </ConfirmationDialog>
  );
};

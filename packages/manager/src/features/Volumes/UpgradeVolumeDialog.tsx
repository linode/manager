import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Typography } from 'src/components/Typography';
import { Link } from 'src/components/Link';
import { useVolumesMigrateMutation } from 'src/queries/volumesMigrations';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { useSnackbar } from 'notistack';

interface CopyProps {
  label: string;
  type: 'volume' | 'linode';
  isManyVolumes?: boolean;
}

export const VolumeUpgradeCopy = (props: CopyProps) => {
  const { label, type, isManyVolumes } = props;

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
    <ActionsPanel
      showPrimary
      primaryButtonHandler={onSubmit}
      primaryButtonLoading={isLoading}
      primaryButtonText="Enter Upgrade Queue"
      showSecondary
      secondaryButtonHandler={onClose}
      secondaryButtonText="Cancel"
    />
  );

  return (
    <ConfirmationDialog
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
      <VolumeUpgradeCopy type="volume" label={label} />
    </ConfirmationDialog>
  );
};

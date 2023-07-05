import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Typography } from 'src/components/Typography';
import { useRevokeTrustedDeviceMutation } from 'src/queries/profile';

interface Props {
  open: boolean;
  onClose: () => void;
  deviceId: number;
}

export const RevokeTrustedDeviceDialog = (props: Props) => {
  const { open, onClose, deviceId } = props;

  const { mutateAsync, error, isLoading } = useRevokeTrustedDeviceMutation(
    deviceId
  );

  const onRevoke = () => {
    mutateAsync().then(() => {
      onClose();
    });
  };

  return (
    <ConfirmationDialog
      open={open}
      title="Revoke Device"
      onClose={onClose}
      error={error?.[0].reason}
      actions={
        <ActionsPanel
          primary
          primaryButtonHandler={onRevoke}
          primaryButtonLoading={isLoading}
          primaryButtonText="Revoke Device"
          secondary
          secondaryButtonHandler={onClose}
          secondaryButtonText="Cancel"
        />
      }
    >
      <Typography>
        Are you sure you want to remove this device from your list of trusted
        devices?
      </Typography>
    </ConfirmationDialog>
  );
};

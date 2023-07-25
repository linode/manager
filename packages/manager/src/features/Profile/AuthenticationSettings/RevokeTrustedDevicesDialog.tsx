import * as React from 'react';

import ActionsPanel from 'src/components/ActionsPanel';
import { Button } from 'src/components/Button/Button';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Typography } from 'src/components/Typography';
import { useRevokeTrustedDeviceMutation } from 'src/queries/profile';

interface Props {
  deviceId: number;
  onClose: () => void;
  open: boolean;
}

export const RevokeTrustedDeviceDialog = (props: Props) => {
  const { deviceId, onClose, open } = props;

  const { error, isLoading, mutateAsync } = useRevokeTrustedDeviceMutation(
    deviceId
  );

  const onRevoke = () => {
    mutateAsync().then(() => {
      onClose();
    });
  };

  return (
    <ConfirmationDialog
      actions={
        <ActionsPanel>
          <Button buttonType="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button buttonType="primary" loading={isLoading} onClick={onRevoke}>
            Revoke Device
          </Button>
        </ActionsPanel>
      }
      error={error?.[0].reason}
      onClose={onClose}
      open={open}
      title="Revoke Device"
    >
      <Typography>
        Are you sure you want to remove this device from your list of trusted
        devices?
      </Typography>
    </ConfirmationDialog>
  );
};

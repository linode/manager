import { useRevokeTrustedDeviceMutation } from '@linode/queries';
import { ActionsPanel, Typography } from '@linode/ui';
import * as React from 'react';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';

interface Props {
  deviceId: number;
  onClose: () => void;
  open: boolean;
}

export const RevokeTrustedDeviceDialog = (props: Props) => {
  const { deviceId, onClose, open } = props;

  const { error, isPending, mutateAsync } =
    useRevokeTrustedDeviceMutation(deviceId);

  const onRevoke = () => {
    mutateAsync().then(() => {
      onClose();
    });
  };

  return (
    <ConfirmationDialog
      actions={
        <ActionsPanel
          primaryButtonProps={{
            label: 'Revoke Device',
            loading: isPending,
            onClick: onRevoke,
          }}
          secondaryButtonProps={{ label: 'Cancel', onClick: onClose }}
        />
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

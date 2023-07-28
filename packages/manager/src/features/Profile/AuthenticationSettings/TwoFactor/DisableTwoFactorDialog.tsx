import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Typography } from 'src/components/Typography';
import { useDisableTwoFactorMutation } from 'src/queries/profile';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  open: boolean;
}

export const DisableTwoFactorDialog = (props: Props) => {
  const { onClose, onSuccess, open } = props;

  const {
    error,
    isLoading,
    mutateAsync: disableTwoFactor,
    reset,
  } = useDisableTwoFactorMutation();

  const handleDisableTFA = async () => {
    await disableTwoFactor();
    onClose();
    onSuccess();
  };

  React.useEffect(() => {
    if (open) {
      reset();
    }
  }, [open]);

  const actions = (
    <ActionsPanel
      primaryButtonProps={{
        'data-testid': 'submit',
        label: 'Disable Two-factor Authentication',
        loading: isLoading,
        onClick: handleDisableTFA,
      }}
      secondaryButtonProps={{
        'data-testid': 'cancel',
        label: 'Cancel',
        onClick: onClose,
      }}
    />
  );

  return (
    <ConfirmationDialog
      actions={actions}
      error={error?.[0].reason}
      onClose={onClose}
      open={open}
      title="Disable Two-Factor Authentication"
    >
      <Typography>
        Are you sure you want to disable two-factor authentication?
      </Typography>
    </ConfirmationDialog>
  );
};

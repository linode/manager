import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Typography } from 'src/components/Typography';
import { useDisableTwoFactorMutation } from 'src/queries/profile';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const DisableTwoFactorDialog = (props: Props) => {
  const { open, onClose, onSuccess } = props;

  const {
    mutateAsync: disableTwoFactor,
    error,
    isLoading,
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
      showPrimary
      primaryButtonDataTestId="submit"
      primaryButtonHandler={handleDisableTFA}
      primaryButtonLoading={isLoading}
      primaryButtonText="Disable Two-factor Authentication"
      showSecondary
      secondaryButtonDataTestId="cancel"
      secondaryButtonHandler={onClose}
      secondaryButtonText="Cancel"
    />
  );

  return (
    <ConfirmationDialog
      open={open}
      title="Disable Two-Factor Authentication"
      onClose={onClose}
      error={error?.[0].reason}
      actions={actions}
    >
      <Typography>
        Are you sure you want to disable two-factor authentication?
      </Typography>
    </ConfirmationDialog>
  );
};

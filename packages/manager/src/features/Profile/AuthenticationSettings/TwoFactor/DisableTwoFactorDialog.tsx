import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import Typography from 'src/components/core/Typography';
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
    <ActionsPanel>
      <Button buttonType="secondary" onClick={onClose} data-qa-cancel>
        Cancel
      </Button>
      <Button
        buttonType="primary"
        onClick={handleDisableTFA}
        loading={isLoading}
        data-qa-submit
      >
        Disable Two-factor Authentication
      </Button>
    </ActionsPanel>
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

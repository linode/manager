import React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Typography from 'src/components/core/Typography';
import { useResetOAuthClientMutation } from 'src/queries/accountOAuth';

interface Props {
  open: boolean;
  onClose: () => void;
  id: string;
  label: string;
  showSecret: (s: string) => void;
}

export const ResetOAuthClientDialog = ({
  open,
  onClose,
  id,
  label,
  showSecret,
}: Props) => {
  const { mutateAsync, isLoading, error } = useResetOAuthClientMutation(id);

  const onReset = () => {
    mutateAsync().then((data) => {
      onClose();
      showSecret(data.secret);
    });
  };

  return (
    <ConfirmationDialog
      error={error?.[0].reason}
      title={`Reset secret for ${label}?`}
      open={open}
      onClose={onClose}
      actions={
        <ActionsPanel>
          <Button buttonType="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button buttonType="primary" onClick={onReset} loading={isLoading}>
            Reset Secret
          </Button>
        </ActionsPanel>
      }
    >
      <Typography>
        Are you sure you want to permanently reset the secret for this app?
      </Typography>
    </ConfirmationDialog>
  );
};

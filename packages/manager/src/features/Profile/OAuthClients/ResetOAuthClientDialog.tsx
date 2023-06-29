import React from 'react';
import ActionsPanel from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
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
        <ActionsPanel
          primary
          primaryButtonHandler={onReset}
          primaryButtonLoading={isLoading}
          primaryButtonText="Reset Secret"
          secondary
          secondaryButtonHandler={onClose}
          secondaryButtonText="Cancel"
        />
      }
    >
      <Typography>
        Are you sure you want to permanently reset the secret for this app?
      </Typography>
    </ConfirmationDialog>
  );
};

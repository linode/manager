import React from 'react';

import ActionsPanel from 'src/components/ActionsPanel';
import { Button } from 'src/components/Button/Button';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Typography } from 'src/components/Typography';
import { useResetOAuthClientMutation } from 'src/queries/accountOAuth';

interface Props {
  id: string;
  label: string;
  onClose: () => void;
  open: boolean;
  showSecret: (s: string) => void;
}

export const ResetOAuthClientDialog = ({
  id,
  label,
  onClose,
  open,
  showSecret,
}: Props) => {
  const { error, isLoading, mutateAsync } = useResetOAuthClientMutation(id);

  const onReset = () => {
    mutateAsync().then((data) => {
      onClose();
      showSecret(data.secret);
    });
  };

  return (
    <ConfirmationDialog
      actions={
        <ActionsPanel>
          <Button buttonType="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button buttonType="primary" loading={isLoading} onClick={onReset}>
            Reset Secret
          </Button>
        </ActionsPanel>
      }
      error={error?.[0].reason}
      onClose={onClose}
      open={open}
      title={`Reset secret for ${label}?`}
    >
      <Typography>
        Are you sure you want to permanently reset the secret for this app?
      </Typography>
    </ConfirmationDialog>
  );
};

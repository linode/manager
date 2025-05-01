import { useResetOAuthClientMutation } from '@linode/queries';
import { ActionsPanel, Typography } from '@linode/ui';
import React from 'react';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';

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
  const { error, isPending, mutateAsync } = useResetOAuthClientMutation(id);

  const onReset = () => {
    mutateAsync().then((data) => {
      onClose();
      showSecret(data.secret);
    });
  };

  return (
    <ConfirmationDialog
      actions={
        <ActionsPanel
          primaryButtonProps={{
            label: 'Reset Secret',
            loading: isPending,
            onClick: onReset,
          }}
          secondaryButtonProps={{ label: 'Cancel', onClick: onClose }}
        />
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

import { Typography } from '@linode/ui';
import React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { useDeleteOAuthClientMutation } from 'src/queries/account/oauth';

interface Props {
  id: string;
  label: string;
  onClose: () => void;
  open: boolean;
}

export const DeleteOAuthClientDialog = ({
  id,
  label,
  onClose,
  open,
}: Props) => {
  const { error, isPending, mutateAsync } = useDeleteOAuthClientMutation(id);

  const onDelete = () => {
    mutateAsync().then(() => {
      onClose();
    });
  };

  return (
    <ConfirmationDialog
      actions={
        <ActionsPanel
          primaryButtonProps={{
            'data-testid': 'button-confirm',
            label: 'Delete',
            loading: isPending,
            onClick: onDelete,
          }}
          secondaryButtonProps={{
            'data-testid': 'button-cancel',
            label: 'Cancel',
            onClick: onClose,
          }}
        />
      }
      error={error?.[0].reason}
      onClose={onClose}
      open={open}
      title={`Delete ${label}?`}
    >
      <Typography>
        Are you sure you want to permanently delete this app?
      </Typography>
    </ConfirmationDialog>
  );
};

import React from 'react';

import ActionsPanel from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Typography } from 'src/components/Typography';
import { useDeleteOAuthClientMutation } from 'src/queries/accountOAuth';

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
  const { error, isLoading, mutateAsync } = useDeleteOAuthClientMutation(id);

  const onDelete = () => {
    mutateAsync().then(() => {
      onClose();
    });
  };

  return (
    <ConfirmationDialog
      actions={
        <ActionsPanel
          primaryButtonDataTestId="button-confirm"
          primaryButtonHandler={onDelete}
          primaryButtonLoading={isLoading}
          primaryButtonText="Delete"
          secondaryButtonDataTestId="button-cancel"
          secondaryButtonHandler={onClose}
          secondaryButtonText="Cancel"
          showPrimary
          showSecondary
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

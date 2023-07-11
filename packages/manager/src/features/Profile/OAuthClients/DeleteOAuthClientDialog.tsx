import React from 'react';
import ActionsPanel from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Typography } from 'src/components/Typography';
import { useDeleteOAuthClientMutation } from 'src/queries/accountOAuth';

interface Props {
  open: boolean;
  onClose: () => void;
  id: string;
  label: string;
}

export const DeleteOAuthClientDialog = ({
  open,
  onClose,
  id,
  label,
}: Props) => {
  const { mutateAsync, isLoading, error } = useDeleteOAuthClientMutation(id);

  const onDelete = () => {
    mutateAsync().then(() => {
      onClose();
    });
  };

  return (
    <ConfirmationDialog
      error={error?.[0].reason}
      title={`Delete ${label}?`}
      open={open}
      onClose={onClose}
      actions={
        <ActionsPanel
          showPrimary
          primaryButtonDataTestId="button-confirm"
          primaryButtonHandler={onDelete}
          primaryButtonLoading={isLoading}
          primaryButtonText="Delete"
          showSecondary
          secondaryButtonDataTestId="button-cancel"
          secondaryButtonHandler={onClose}
          secondaryButtonText="Cancel"
        />
      }
    >
      <Typography>
        Are you sure you want to permanently delete this app?
      </Typography>
    </ConfirmationDialog>
  );
};

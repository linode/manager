import React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import { Button } from 'src/components/Button/Button';
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
        <ActionsPanel>
          <Button
            buttonType="secondary"
            onClick={onClose}
            data-qa-button-cancel
          >
            Cancel
          </Button>
          <Button
            buttonType="primary"
            onClick={onDelete}
            loading={isLoading}
            data-qa-button-confirm
          >
            Delete
          </Button>
        </ActionsPanel>
      }
    >
      <Typography>
        Are you sure you want to permanently delete this app?
      </Typography>
    </ConfirmationDialog>
  );
};

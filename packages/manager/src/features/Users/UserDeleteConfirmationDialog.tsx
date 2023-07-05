import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';

interface Props {
  username: string;
  open: boolean;
  onDelete: () => void;
  onCancel: () => void;
}

export const UserDeleteConfirmationDialog = (props: Props) => {
  const { onDelete, onCancel, open, username } = props;

  return (
    <ConfirmationDialog
      title="Confirm Deletion"
      onClose={onCancel}
      open={open}
      actions={
        <ActionsPanel
          style={{ padding: 0 }}
          primary
          primaryButtonDataTestId="confirm-delete"
          primaryButtonHandler={onDelete}
          primaryButtonText="Delete"
          secondary
          secondaryButtonDataTestId="cancel-delete"
          secondaryButtonHandler={onCancel}
          secondaryButtonText="Cancel"
        />
      }
    >
      User {username} will be permanently deleted. Are you sure?
    </ConfirmationDialog>
  );
};

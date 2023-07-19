import * as React from 'react';

import ActionsPanel from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';

interface Props {
  onCancel: () => void;
  onDelete: () => void;
  open: boolean;
  username: string;
}

export const UserDeleteConfirmationDialog = (props: Props) => {
  const { onCancel, onDelete, open, username } = props;

  return (
    <ConfirmationDialog
      actions={
        <ActionsPanel
          primaryButtonDataTestId="confirm-delete"
          primaryButtonHandler={onDelete}
          primaryButtonText="Delete"
          secondaryButtonDataTestId="cancel-delete"
          secondaryButtonHandler={onCancel}
          secondaryButtonText="Cancel"
          showPrimary
          showSecondary
          style={{ padding: 0 }}
        />
      }
      onClose={onCancel}
      open={open}
      title="Confirm Deletion"
    >
      User {username} will be permanently deleted. Are you sure?
    </ConfirmationDialog>
  );
};

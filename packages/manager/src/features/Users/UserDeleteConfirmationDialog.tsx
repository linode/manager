import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
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
          primaryButtonProps={{
            'data-testid': 'confirm-delete',
            label: 'Delete',
            onClick: onDelete,
          }}
          secondaryButtonProps={{
            'data-testid': 'cancel-delete',
            label: 'Cancel',
            onClick: onCancel,
          }}
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

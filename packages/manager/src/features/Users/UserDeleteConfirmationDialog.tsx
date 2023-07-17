import * as React from 'react';

import ActionsPanel from 'src/components/ActionsPanel';
import { Button } from 'src/components/Button/Button';
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
        <ActionsPanel style={{ padding: 0 }}>
          <Button
            buttonType="secondary"
            data-qa-cancel-delete
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            buttonType="primary"
            data-qa-confirm-delete
            onClick={onDelete}
          >
            Delete
          </Button>
        </ActionsPanel>
      }
      onClose={onCancel}
      open={open}
      title="Confirm Deletion"
    >
      User {username} will be permanently deleted. Are you sure?
    </ConfirmationDialog>
  );
};

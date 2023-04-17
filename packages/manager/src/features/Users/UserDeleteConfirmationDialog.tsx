import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';

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
        <ActionsPanel style={{ padding: 0 }}>
          <Button
            buttonType="secondary"
            onClick={onCancel}
            data-qa-cancel-delete
          >
            Cancel
          </Button>
          <Button
            buttonType="primary"
            onClick={onDelete}
            data-qa-confirm-delete
          >
            Delete
          </Button>
        </ActionsPanel>
      }
    >
      User {username} will be permanently deleted. Are you sure?
    </ConfirmationDialog>
  );
};

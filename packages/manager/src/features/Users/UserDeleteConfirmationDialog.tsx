import { useSnackbar } from 'notistack';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { useAccountUserDeleteMutation } from 'src/queries/accountUsers';

interface Props {
  onClose: () => void;
  open: boolean;
  username: string;
}

export const UserDeleteConfirmationDialog = (props: Props) => {
  const { onClose: _onClose, open, username } = props;

  const { enqueueSnackbar } = useSnackbar();

  const {
    error,
    mutateAsync: deleteUser,
    reset,
  } = useAccountUserDeleteMutation(username);

  const onClose = () => {
    reset(); // resets the error state of the useMutation
    _onClose();
  };

  const onDelete = async () => {
    try {
      await deleteUser();
      enqueueSnackbar(`User ${username} has been deleted successfully.`, {
        variant: 'success',
      });
      onClose();
    } catch (error) {
      // Error is shown in the ConfirmationDialog
    }
  };

  return (
    <ConfirmationDialog
      actions={
        <ActionsPanel
          primaryButtonProps={{
            label: 'Delete',
            onClick: onDelete,
          }}
          secondaryButtonProps={{
            label: 'Cancel',
            onClick: onClose,
          }}
          style={{ padding: 0 }}
        />
      }
      error={error?.[0].reason}
      onClose={onClose}
      open={open}
      title="Confirm Deletion"
    >
      User {username} will be permanently deleted. Are you sure?
    </ConfirmationDialog>
  );
};

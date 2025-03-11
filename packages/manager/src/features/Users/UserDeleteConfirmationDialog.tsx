import { ActionsPanel } from '@linode/ui';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { useAccountUserDeleteMutation } from '@linode/queries';

interface Props {
  onClose: () => void;
  onSuccess?: () => void;
  open: boolean;
  username: string;
}

export const UserDeleteConfirmationDialog = (props: Props) => {
  const { onClose: _onClose, onSuccess, open, username } = props;

  const { enqueueSnackbar } = useSnackbar();

  const {
    error,
    isPending,
    mutateAsync: deleteUser,
    reset,
  } = useAccountUserDeleteMutation(username);

  const onClose = () => {
    reset(); // resets the error state of the useMutation
    _onClose();
  };

  const onDelete = async () => {
    await deleteUser();
    enqueueSnackbar(`User ${username} has been deleted successfully.`, {
      variant: 'success',
    });
    if (onSuccess) {
      onSuccess();
    }
    onClose();
  };

  return (
    <ConfirmationDialog
      actions={
        <ActionsPanel
          primaryButtonProps={{
            label: 'Delete',
            loading: isPending,
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

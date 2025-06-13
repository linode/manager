import { useUserRoles, useUserRolesMutation } from '@linode/queries';
import { ActionsPanel, Notice, Typography } from '@linode/ui';
import { useParams } from '@tanstack/react-router';
import { useSnackbar } from 'notistack';
import React from 'react';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';

import { deleteUserRole } from '../utilities';

import type { ExtendedRoleView } from '../types';

interface Props {
  onClose: () => void;
  onSuccess?: () => void;
  open: boolean;
  role: ExtendedRoleView | undefined;
}

export const UnassignRoleConfirmationDialog = (props: Props) => {
  const { onClose: _onClose, onSuccess, open, role } = props;
  const { username } = useParams({ from: '/iam/users/$username' });

  const { enqueueSnackbar } = useSnackbar();

  const {
    error,
    isPending,
    mutateAsync: updateUserRoles,
    reset,
  } = useUserRolesMutation(username);

  const { data: assignedRoles } = useUserRoles(username ?? '');

  const onClose = () => {
    reset(); // resets the error state of the useMutation
    _onClose();
  };

  const onDelete = async () => {
    const initialRole = role?.name;
    const access = role?.access;

    const updatedUserRoles = deleteUserRole({
      access,
      assignedRoles,
      initialRole,
    });

    await updateUserRoles(updatedUserRoles);

    enqueueSnackbar(`Role ${role?.name} has been deleted successfully.`, {
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
            label: 'Remove',
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
      title={`Unassign the ${role?.name} role?`}
    >
      <Notice variant="warning">
        <Typography>
          You’re about to remove the <strong>{role?.name}</strong> role from{' '}
          <strong>{username}</strong>. The change will be applied immediately.
        </Typography>
      </Notice>
    </ConfirmationDialog>
  );
};

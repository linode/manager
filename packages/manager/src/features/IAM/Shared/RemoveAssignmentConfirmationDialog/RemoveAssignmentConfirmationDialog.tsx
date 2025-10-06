import { useUserRoles, useUserRolesMutation } from '@linode/queries';
import { ActionsPanel, Notice, Typography } from '@linode/ui';
import { useParams } from '@tanstack/react-router';
import { useSnackbar } from 'notistack';
import React from 'react';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';

import { deleteUserEntity, getErrorMessage } from '../utilities';

import type { EntitiesRole } from '../types';

interface Props {
  onClose: () => void;
  onSuccess?: () => void;
  open: boolean;
  role: EntitiesRole | undefined;
}

export const RemoveAssignmentConfirmationDialog = (props: Props) => {
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
    if (!role || !assignedRoles) return;

    const { role_name, entity_id, entity_type } = role;

    const updatedUserEntityRoles = deleteUserEntity(
      assignedRoles.entity_access,
      role_name,
      entity_id,
      entity_type
    );

    await updateUserRoles({
      ...assignedRoles,
      entity_access: updatedUserEntityRoles,
    });

    enqueueSnackbar(`Entity access removed`, {
      variant: 'success',
    });

    onSuccess?.();
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
      error={getErrorMessage(error)}
      onClose={onClose}
      open={open}
      title={`Remove the ${role?.entity_name} entity from the ${role?.role_name} role assignment?`}
    >
      <Notice variant="warning">
        <Typography>
          You’re about to remove the <strong>{role?.entity_name}</strong> entity
          from the <strong>{role?.role_name}</strong> role for{' '}
          <strong>{username}</strong>. This change will be applied immediately.
        </Typography>
      </Notice>
    </ConfirmationDialog>
  );
};

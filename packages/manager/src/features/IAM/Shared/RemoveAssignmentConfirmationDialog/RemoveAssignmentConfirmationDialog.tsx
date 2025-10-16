import {
  useUpdateDefaultDelegationAccessQuery,
  useUserRoles,
  useUserRolesMutation,
} from '@linode/queries';
import { ActionsPanel, Notice, Typography } from '@linode/ui';
import { useSnackbar } from 'notistack';
import React from 'react';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';

import { useIsDefaultDelegationRolesForChildAccount } from '../../hooks/useDelegationRole';
import { deleteUserEntity, getErrorMessage } from '../utilities';

import type { EntitiesRole } from '../types';

interface Props {
  onClose: () => void;
  onSuccess?: () => void;
  open: boolean;
  role: EntitiesRole | undefined;
  username?: string;
}

export const RemoveAssignmentConfirmationDialog = (props: Props) => {
  const { onClose: _onClose, onSuccess, open, role, username } = props;

  const { isDefaultDelegationRolesForChildAccount } =
    useIsDefaultDelegationRolesForChildAccount();

  const { enqueueSnackbar } = useSnackbar();

  const {
    error,
    isPending,
    mutateAsync: updateUserRoles,
    reset,
  } = useUserRolesMutation(username ?? '');

  const { mutateAsync: updateDefaultDelegationRoles } =
    useUpdateDefaultDelegationAccessQuery();

  const { data: assignedRoles } = useUserRoles(username ?? '');

  const onClose = () => {
    reset(); // resets the error state of the useMutation
    _onClose();
  };

  const mutationFn = isDefaultDelegationRolesForChildAccount
    ? updateDefaultDelegationRoles
    : updateUserRoles;

  const onDelete = async () => {
    if (!role || !assignedRoles) return;

    const { role_name, entity_id, entity_type } = role;

    const updatedUserEntityRoles = deleteUserEntity(
      assignedRoles.entity_access,
      role_name,
      entity_id,
      entity_type
    );

    await mutationFn({
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
      title={
        isDefaultDelegationRolesForChildAccount
          ? `Remove the ${role?.entity_name} entity from the list?`
          : `Remove the ${role?.entity_name} entity from the ${role?.role_name} role assignment?`
      }
    >
      <Notice variant="warning">
        {isDefaultDelegationRolesForChildAccount ? (
          <Typography>
            Delegated users won’t get the {role?.role_name} access on the{' '}
            {role?.entity_name} entity by default.
          </Typography>
        ) : (
          <Typography>
            You’re about to remove the <strong>{role?.entity_name}</strong>{' '}
            entity from the <strong>{role?.role_name}</strong> role for{' '}
            <strong>{username}</strong>. This change will be applied
            immediately.
          </Typography>
        )}
      </Notice>
    </ConfirmationDialog>
  );
};

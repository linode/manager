import {
  useUpdateDefaultDelegationAccessQuery,
  useUserRolesMutation,
} from '@linode/queries';
import { ActionsPanel, Notice, Typography } from '@linode/ui';
import { useSnackbar } from 'notistack';
import React from 'react';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';

import { deleteUserRole, getErrorMessage } from '../utilities';

import type { ExtendedRoleView } from '../types';
import type { IamUserRoles } from '@linode/api-v4';

interface Props {
  assignedRoles?: IamUserRoles;
  isDefaultRolesView?: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  open: boolean;
  role: ExtendedRoleView | undefined;
  username?: string;
}

export const UnassignRoleConfirmationDialog = (props: Props) => {
  const {
    onClose: _onClose,
    onSuccess,
    open,
    role,
    username,
    assignedRoles,
    isDefaultRolesView = false,
  } = props;
  const { enqueueSnackbar } = useSnackbar();

  const {
    error,
    isPending,
    mutateAsync: updateUserRoles,
    reset,
  } = useUserRolesMutation(username || '');

  const { mutateAsync: updateDefaultRoles, isPending: isDefaultRolesPending } =
    useUpdateDefaultDelegationAccessQuery();

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

    if (isDefaultRolesView) {
      await updateDefaultRoles(updatedUserRoles);
    } else {
      await updateUserRoles(updatedUserRoles);
    }

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
            loading: isPending || isDefaultRolesPending,
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

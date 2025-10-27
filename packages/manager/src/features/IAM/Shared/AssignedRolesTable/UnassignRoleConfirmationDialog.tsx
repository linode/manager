import {
  useGetDefaultDelegationAccessQuery,
  useUpdateDefaultDelegationAccessQuery,
  useUserRoles,
  useUserRolesMutation,
} from '@linode/queries';
import { ActionsPanel, Notice, Typography } from '@linode/ui';
import { useParams } from '@tanstack/react-router';
import { useSnackbar } from 'notistack';
import React from 'react';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';

import { useIsDefaultDelegationRolesForChildAccount } from '../../hooks/useDelegationRole';
import { deleteUserRole, getErrorMessage } from '../utilities';

import type { ExtendedRoleView } from '../types';

interface Props {
  onClose: () => void;
  onSuccess?: () => void;
  open: boolean;
  role: ExtendedRoleView | undefined;
}

export const UnassignRoleConfirmationDialog = (props: Props) => {
  const { onClose: _onClose, onSuccess, open, role } = props;
  const { enqueueSnackbar } = useSnackbar();
  const { username } = useParams({ strict: false });
  const { isDefaultDelegationRolesForChildAccount } =
    useIsDefaultDelegationRolesForChildAccount();
  const { data: defaultRolesData } = useGetDefaultDelegationAccessQuery({
    enabled: isDefaultDelegationRolesForChildAccount,
  });

  const { data: userRolesData } = useUserRoles(
    username ?? '',
    !isDefaultDelegationRolesForChildAccount
  );

  const assignedRoles = isDefaultDelegationRolesForChildAccount
    ? defaultRolesData
    : userRolesData;
  const {
    error,
    isPending,
    mutateAsync: updateUserRoles,
    reset,
  } = useUserRolesMutation(username, Boolean(username));

  const { mutateAsync: updateDefaultRoles, isPending: isDefaultRolesPending } =
    useUpdateDefaultDelegationAccessQuery();

  const mutationFn = isDefaultDelegationRolesForChildAccount
    ? updateDefaultRoles
    : updateUserRoles;

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

    await mutationFn(updatedUserRoles);

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

import { ActionsPanel, Notice, Typography } from '@linode/ui';
import { useTheme } from '@mui/material';
import { useSnackbar } from 'notistack';
import React from 'react';
import { useParams } from 'react-router-dom';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import {
  useAccountUserPermissions,
  useAccountUserPermissionsMutation,
} from 'src/queries/iam/iam';

import { deleteUserRole } from '../utilities';

import type { ExtendedRoleMap } from '../utilities';

interface Props {
  onClose: () => void;
  onSuccess?: () => void;
  open: boolean;
  role: ExtendedRoleMap | undefined;
}

export const UnassignRoleConfirmationDialog = (props: Props) => {
  const { onClose: _onClose, onSuccess, open, role } = props;
  const { username } = useParams<{ username: string }>();

  const theme = useTheme();

  const { enqueueSnackbar } = useSnackbar();

  const {
    error,
    isPending,
    mutateAsync: updateUserPermissions,
    reset,
  } = useAccountUserPermissionsMutation(username);

  const { data: assignedRoles } = useAccountUserPermissions(username ?? '');

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

    await updateUserPermissions(updatedUserRoles);

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
          You’re about to remove the{' '}
          <span style={{ font: theme.font.bold }}>{role?.name}</span> role from{' '}
          <span style={{ font: theme.font.bold }}>{username}</span>. The change
          will be applied immidiately.
        </Typography>
      </Notice>
    </ConfirmationDialog>
  );
};

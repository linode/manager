import { toast } from '@akamai/cds-components/notification-toast';
import {
  Button,
  Modal,
  NotificationBanner,
} from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import {
  useGetDefaultDelegationAccessQuery,
  useUpdateDefaultDelegationAccessQuery,
  useUserRoles,
  useUserRolesMutation,
} from '@linode/queries';
import { useParams } from '@tanstack/react-router';
import React from 'react';

import { useIsDefaultDelegationRolesForChildAccount } from '../../hooks/useDelegationRole';
import { ErrorState } from '../ErrorState/ErrorState';
import styles from '../RemoveAssignmentConfirmationDialog/RemoveAssignmentConfirmationDialog.module.css';
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
    error: userRolesError,
    isPending,
    mutateAsync: updateUserRoles,
    reset,
  } = useUserRolesMutation(username);

  const {
    mutateAsync: updateDefaultRoles,
    isPending: isDefaultRolesPending,
    error: defaultDelegationRolesError,
  } = useUpdateDefaultDelegationAccessQuery();

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
    try {
      await mutationFn(updatedUserRoles);

      toast.open({
        text: `Role ${role?.name} has been deleted successfully.`,
        type: 'success',
      });
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch {
      // The error state is handled by the useMutation hooks, so we don't need to do anything here
    }
  };

  const error = isDefaultDelegationRolesForChildAccount
    ? defaultDelegationRolesError
    : userRolesError;

  return (
    <Modal
      className={styles.removeAssignmentDialog}
      onModalClosed={onClose}
      open={open}
      role="dialog"
      size={error ? 'medium' : 'small'}
      titleMaxLength={150}
    >
      <span slot="title">
        {isDefaultDelegationRolesForChildAccount
          ? `Remove role from the list?`
          : `Unassign role?`}
      </span>
      <div slot="body">
        <NotificationBanner type="warning">
          {isDefaultDelegationRolesForChildAccount ? (
            <p style={{ marginBottom: Spacing.S0 }}>
              The <strong>{role?.name}</strong> role won’t be added to delegate
              users by default.
            </p>
          ) : (
            <p style={{ marginBottom: Spacing.S0 }}>
              You’re about to remove the <strong>{role?.name}</strong> role from{' '}
              <strong>{username}</strong>. The change will be applied
              immediately.
            </p>
          )}
        </NotificationBanner>
        {error && <ErrorState errorText={getErrorMessage(error)} />}
      </div>
      <div
        slot="actions"
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: Spacing.S8,
          marginTop: Spacing.S16,
          alignItems: 'center',
        }}
      >
        <Button
          onClick={onClose}
          style={{ marginRight: Spacing.S8 }}
          variant="link"
        >
          Cancel
        </Button>
        <Button
          disabled={isPending || isDefaultRolesPending}
          onClick={onDelete}
          processing={isPending || isDefaultRolesPending}
          variant="primary"
        >
          Remove
        </Button>
      </div>
    </Modal>
  );
};

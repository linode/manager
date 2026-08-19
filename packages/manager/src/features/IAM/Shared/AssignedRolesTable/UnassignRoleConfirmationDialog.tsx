import { toast } from '@akamai/cds-components/notification-toast';
import {
  Button,
  Modal,
  NotificationBanner,
} from '@akamai/cds-components/react';
import { LoadingSpinner } from '@akamai/cds-components/react/LoadingSpinner';
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
import { usePermissions } from '../../hooks/usePermissions';
import { ErrorState } from '../ErrorState/ErrorState';
import styles from '../RemoveAssignmentConfirmationDialog/RemoveAssignmentConfirmationDialog.module.css';
import { deleteUserRole, getErrorMessage } from '../utilities';

import type { ExtendedRoleView } from '../types';

interface Props {
  isRolesLoading?: boolean;
  onClose: () => void;
  /** Clears remaining URL params after the exit animation finishes. */
  onExited?: () => void;
  onSuccess?: () => void;
  open: boolean;
  role: ExtendedRoleView | undefined;
}

export const UnassignRoleConfirmationDialog = (props: Props) => {
  const {
    isRolesLoading = false,
    onClose: _onClose,
    onExited,
    onSuccess,
    open,
    role,
  } = props;
  const { username } = useParams({ strict: false });
  const { isDefaultDelegationRolesForChildAccount } =
    useIsDefaultDelegationRolesForChildAccount();
  const { data: defaultRolesData } = useGetDefaultDelegationAccessQuery({
    enabled: isDefaultDelegationRolesForChildAccount,
  });

  const { data: permissions } = usePermissions('account', [
    'is_account_admin',
    'update_default_delegate_access',
  ]);

  const permissionToCheck = isDefaultDelegationRolesForChildAccount
    ? permissions?.update_default_delegate_access
    : permissions?.is_account_admin;

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
    reset: resetUserRoles,
  } = useUserRolesMutation(username);

  const {
    mutateAsync: updateDefaultRoles,
    isPending: isDefaultRolesPending,
    error: defaultDelegationRolesError,
    reset: resetDefaultRoles,
  } = useUpdateDefaultDelegationAccessQuery();

  const mutationFn = isDefaultDelegationRolesForChildAccount
    ? updateDefaultRoles
    : updateUserRoles;

  const resetFn = isDefaultDelegationRolesForChildAccount
    ? resetDefaultRoles
    : resetUserRoles;

  // before-closed runs while Lit `_state === 'closing'`, when re-asserting
  // open=true is ignored — so the router can clear `open` during the exit animation.
  // Only clear `action` here so `role` stays available for the exit frame.
  const onClose = () => {
    _onClose();
  };

  const onModalClosed = () => {
    resetFn();
    onExited?.();
  };

  const onDelete = async () => {
    if (!role) return;

    const initialRole = role.name;
    const access = role.access;

    const updatedUserRoles = deleteUserRole({
      access,
      assignedRoles,
      initialRole,
    });
    try {
      await mutationFn(updatedUserRoles);

      toast.open({
        text: `Role ${role.name} has been deleted successfully.`,
        type: 'success',
      });
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch {
      // The error state is handled by the useMutation hooks, so we don't need to do anything here
    }
  };

  const removeText = !permissionToCheck
    ? `You do not have permission to ${isDefaultDelegationRolesForChildAccount ? 'remove' : 'unassign'} this role.`
    : undefined;

  const error = isDefaultDelegationRolesForChildAccount
    ? defaultDelegationRolesError
    : userRolesError;

  const roleMissing = !isRolesLoading && !role;
  const canSubmit = Boolean(role) && !isRolesLoading;

  return (
    <Modal
      className={styles.removeAssignmentDialog}
      onModalBeforeClosed={onClose}
      onModalClosed={onModalClosed}
      open={open}
      role="dialog"
      size={error || roleMissing || !permissionToCheck ? 'medium' : 'small'}
      titleMaxLength={150}
    >
      <span slot="title">
        {isDefaultDelegationRolesForChildAccount
          ? `Remove role from the list?`
          : `Unassign role?`}
      </span>
      <div slot="body">
        {isRolesLoading ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              padding: Spacing.S24,
            }}
          >
            <LoadingSpinner data-testid="circle-progress" size="medium" />
          </div>
        ) : roleMissing ? (
          <NotificationBanner type="error">
            <p style={{ marginBottom: Spacing.S0 }}>
              This role is no longer assigned or could not be found.
            </p>
          </NotificationBanner>
        ) : (
          <>
            {!permissionToCheck && (
              <NotificationBanner
                style={{ marginBottom: Spacing.S8 }}
                text={removeText}
                type="error"
              />
            )}
            <NotificationBanner type="warning">
              {isDefaultDelegationRolesForChildAccount ? (
                <p style={{ marginBottom: Spacing.S0 }}>
                  The <strong>{role?.name}</strong> role won’t be added to
                  delegate users by default.
                </p>
              ) : (
                <p style={{ marginBottom: Spacing.S0 }}>
                  You’re about to remove the <strong>{role?.name}</strong> role
                  from <strong>{username}</strong>. The change will be applied
                  immediately.
                </p>
              )}
            </NotificationBanner>
            {error && <ErrorState errorText={getErrorMessage(error)} />}
          </>
        )}
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
          {roleMissing ? 'Close' : 'Cancel'}
        </Button>
        {!roleMissing && !isRolesLoading && (
          <Button
            disabled={!canSubmit || !permissionToCheck}
            onClick={onDelete}
            processing={isPending || isDefaultRolesPending}
            variant="primary"
          >
            Remove
          </Button>
        )}
      </div>
    </Modal>
  );
};

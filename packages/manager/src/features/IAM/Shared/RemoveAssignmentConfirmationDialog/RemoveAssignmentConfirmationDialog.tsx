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
import React from 'react';

import { useIsDefaultDelegationRolesForChildAccount } from '../../hooks/useDelegationRole';
import { usePermissions } from '../../hooks/usePermissions';
import { ErrorState } from '../ErrorState/ErrorState';
import { deleteUserEntity, getErrorMessage } from '../utilities';
import styles from './RemoveAssignmentConfirmationDialog.module.css';

import type { EntitiesRole } from '../types';

interface Props {
  isRolesLoading?: boolean;
  onClose: () => void;
  /** Clears remaining URL params after the exit animation finishes. */
  onExited?: () => void;
  onSuccess?: () => void;
  open: boolean;
  role: EntitiesRole | undefined;
  username?: string;
}

export const RemoveAssignmentConfirmationDialog = (props: Props) => {
  const {
    isRolesLoading = false,
    onClose: _onClose,
    onExited,
    onSuccess,
    open,
    role,
    username,
  } = props;

  const { isDefaultDelegationRolesForChildAccount } =
    useIsDefaultDelegationRolesForChildAccount();

  const { data: permissions } = usePermissions('account', [
    'is_account_admin',
    'update_default_delegate_access',
  ]);

  const permissionToCheck = isDefaultDelegationRolesForChildAccount
    ? permissions?.update_default_delegate_access
    : permissions?.is_account_admin;

  const {
    error: userRolesError,
    isPending: isUserRolesPending,
    mutateAsync: updateUserRoles,
    reset,
  } = useUserRolesMutation(username ?? '');

  const {
    mutateAsync: updateDefaultDelegationRoles,
    isPending: isDefaultDelegationRolesPending,
    error: defaultDelegationRolesError,
  } = useUpdateDefaultDelegationAccessQuery();

  const isPending = isUserRolesPending || isDefaultDelegationRolesPending;

  const { data: assignedUserRoles } = useUserRoles(
    username ?? '',
    !isDefaultDelegationRolesForChildAccount
  );

  const { data: delegateDefaultRoles } = useGetDefaultDelegationAccessQuery({
    enabled: isDefaultDelegationRolesForChildAccount,
  });

  // before-closed runs while Lit `_state === 'closing'`, when re-asserting
  // open=true is ignored — so the router can clear `open` during the exit animation.
  // Only clear `action` here so `role` stays available for the exit frame.
  const onClose = () => {
    _onClose();
  };

  const onModalClosed = () => {
    reset();
    onExited?.();
  };

  const mutationFn = isDefaultDelegationRolesForChildAccount
    ? updateDefaultDelegationRoles
    : updateUserRoles;

  const assignedRoles = isDefaultDelegationRolesForChildAccount
    ? delegateDefaultRoles
    : assignedUserRoles;

  const onDelete = async () => {
    if (!role || !assignedRoles || isPending) return;

    const { role_name, entity_id, entity_type } = role;

    const updatedUserEntityRoles = deleteUserEntity(
      assignedRoles.entity_access,
      role_name,
      entity_id,
      entity_type
    );
    try {
      await mutationFn({
        ...assignedRoles,
        entity_access: updatedUserEntityRoles,
      });

      toast.open({
        text: 'Entity access removed',
        type: 'success',
      });

      onSuccess?.();
      onClose();
    } catch {
      // error is handled by react-query and shown via <ConfirmationDialog error=… />
    }
  };
  const error = isDefaultDelegationRolesForChildAccount
    ? defaultDelegationRolesError
    : userRolesError;

  const assignmentMissing = !isRolesLoading && !role;
  const canSubmit = Boolean(role) && !isRolesLoading;

  return (
    <Modal
      className={styles.removeAssignmentDialog}
      onModalBeforeClosed={onClose}
      onModalClosed={onModalClosed}
      open={open}
      role="dialog"
      size={
        error || assignmentMissing || !permissionToCheck ? 'medium' : 'small'
      }
    >
      <span slot="title">
        {isDefaultDelegationRolesForChildAccount
          ? `Remove entity from the list?`
          : `Remove entity from the role assignment?`}
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
        ) : assignmentMissing ? (
          <NotificationBanner type="error">
            <p style={{ marginBottom: Spacing.S0 }}>
              This role assignment or entity could not be found.
            </p>
          </NotificationBanner>
        ) : (
          <>
            {!permissionToCheck && (
              <NotificationBanner
                style={{ marginBottom: Spacing.S8 }}
                text="You do not have permission to remove this assignment."
                type="error"
              />
            )}
            <NotificationBanner type="warning">
              {isDefaultDelegationRolesForChildAccount ? (
                <p style={{ marginBottom: Spacing.S0 }}>
                  Delegate users won’t get the{' '}
                  <strong>{role?.role_name}</strong> access on the{' '}
                  <strong style={{ wordBreak: 'break-word' }}>
                    {role?.entity_name}
                  </strong>{' '}
                  entity by default.
                </p>
              ) : (
                <p style={{ marginBottom: Spacing.S0 }}>
                  You’re about to remove the{' '}
                  <strong style={{ wordBreak: 'break-word' }}>
                    {role?.entity_name}
                  </strong>{' '}
                  entity from the <strong>{role?.role_name}</strong> role for{' '}
                  <strong>{username}</strong>. This change will be applied
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
          {assignmentMissing ? 'Close' : 'Cancel'}
        </Button>
        {!assignmentMissing && !isRolesLoading && (
          <Button
            disabled={!canSubmit || !permissionToCheck}
            onClick={onDelete}
            processing={isPending}
            variant="primary"
          >
            Remove
          </Button>
        )}
      </div>
    </Modal>
  );
};

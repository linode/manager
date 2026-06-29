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
import React from 'react';

import { useIsDefaultDelegationRolesForChildAccount } from '../../hooks/useDelegationRole';
import { ErrorState } from '../ErrorState/ErrorState';
import { deleteUserEntity, getErrorMessage } from '../utilities';
import styles from './RemoveAssignmentConfirmationDialog.module.css';

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

  const onClose = () => {
    reset(); // resets the error state of the useMutation
    _onClose();
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

  return (
    <Modal
      className={styles.removeAssignmentDialog}
      onModalClosed={onClose}
      open={open}
      role="dialog"
      size={error ? 'medium' : 'small'}
    >
      <span slot="title">
        {isDefaultDelegationRolesForChildAccount
          ? `Remove entity from the list?`
          : `Remove entity from the role assignment?`}
      </span>
      <div slot="body">
        <NotificationBanner type="warning">
          {isDefaultDelegationRolesForChildAccount ? (
            <p style={{ marginBottom: Spacing.S0 }}>
              Delegate users won’t get the <strong>{role?.role_name}</strong>{' '}
              access on the{' '}
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
          disabled={isPending}
          onClick={onDelete}
          processing={isPending}
          variant="primary"
        >
          Remove
        </Button>
      </div>
    </Modal>
  );
};

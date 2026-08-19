import { toast } from '@akamai/cds-components/notification-toast';
import {
  Button,
  Modal,
  NotificationBanner,
} from '@akamai/cds-components/react';
import { LoadingSpinner } from '@akamai/cds-components/react/LoadingSpinner';
import { Spacing } from '@akamai/cds-tokens';
import { useAccountUser, useAccountUserDeleteMutation } from '@linode/queries';
import * as React from 'react';

import { useDelegationRole } from '../hooks/useDelegationRole';
import { usePermissions } from '../hooks/usePermissions';
import { ErrorState } from './ErrorState/ErrorState';
import styles from './RemoveAssignmentConfirmationDialog/RemoveAssignmentConfirmationDialog.module.css';
import { getDeleteUserTooltipText } from './utilities';

interface Props {
  onClose: () => void;
  /** Clears remaining URL params after the exit animation finishes. */
  onExited?: () => void;
  onSuccess?: () => void;
  open: boolean;
  username: string;
}

export const UserDeleteConfirmation = (props: Props) => {
  const { onClose: _onClose, onExited, onSuccess, open, username } = props;

  const { profileUserName } = useDelegationRole();

  const {
    data: permissions,
    isLoading: isLoadingPermissions,
    error: permissionsError,
  } = usePermissions('account', ['delete_user']);

  const {
    data: user,
    error: userError,
    isLoading: isLoadingUser,
  } = useAccountUser(username);

  const isDelegateUserType = user?.user_type === 'delegate';

  const isDeleteUserDisabled =
    !permissions.delete_user ||
    profileUserName === username ||
    isDelegateUserType;

  const deleteText = getDeleteUserTooltipText(
    permissions.delete_user,
    profileUserName,
    username,
    isDelegateUserType
  );

  const {
    error,
    isPending,
    mutateAsync: deleteUser,
    reset,
  } = useAccountUserDeleteMutation(username);

  const onClose = () => {
    _onClose();
  };

  const onModalClosed = () => {
    reset();
    onExited?.();
  };

  const onDelete = async () => {
    await deleteUser();
    toast.open({
      text: `User ${username} has been successfully deleted.`,
      type: 'success',
    });
    onClose();
    if (onSuccess) {
      onSuccess();
    }
  };

  const isLoading = isLoadingUser || isLoadingPermissions;
  const loadError = userError || permissionsError;
  const userMissing = !isLoadingUser && !user;

  return (
    <Modal
      className={styles.removeAssignmentDialog}
      onModalBeforeClosed={onClose}
      onModalClosed={onModalClosed}
      open={open}
      role="dialog"
      size={
        error || isDeleteUserDisabled || loadError || userMissing
          ? 'medium'
          : 'small'
      }
    >
      <span slot="title">{`Delete user?`}</span>
      <div slot="body">
        {isLoading ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              padding: Spacing.S24,
            }}
          >
            <LoadingSpinner data-testid="circle-progress" size="medium" />
          </div>
        ) : null}
        {!isLoading && (loadError || userMissing) ? (
          <NotificationBanner type="error">
            <p style={{ marginBottom: Spacing.S0 }}>
              {userMissing && 'This user could not be found.'}
              {loadError &&
                !userMissing &&
                'An error occurred while loading user details.'}
            </p>
          </NotificationBanner>
        ) : null}
        {!isLoading && !loadError && !userMissing ? (
          <>
            {isDeleteUserDisabled && (
              <NotificationBanner
                style={{ marginBottom: Spacing.S8 }}
                text={deleteText}
                type="error"
              />
            )}
            <NotificationBanner type="warning">
              <strong>Warning:</strong> Deleting <strong>{username}</strong> is
              permanent and can&apos;t be undone.
            </NotificationBanner>
            {error && <ErrorState />}
          </>
        ) : null}
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
          {loadError || userMissing ? 'Close' : 'Cancel'}
        </Button>
        {!loadError && !userMissing && !isLoading && (
          <Button
            disabled={isDeleteUserDisabled}
            onClick={onDelete}
            processing={isPending}
            variant="primary"
          >
            Delete User
          </Button>
        )}
      </div>
    </Modal>
  );
};

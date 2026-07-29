import { toast } from '@akamai/cds-components/notification-toast';
import {
  Button,
  Modal,
  NotificationBanner,
} from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import { useAccountUserDeleteMutation } from '@linode/queries';
import * as React from 'react';

import { ErrorState } from './ErrorState/ErrorState';
import styles from './RemoveAssignmentConfirmationDialog/RemoveAssignmentConfirmationDialog.module.css';

interface Props {
  onClose: () => void;
  onSuccess?: () => void;
  open: boolean;
  username: string;
}

export const UserDeleteConfirmation = (props: Props) => {
  const { onClose: _onClose, onSuccess, open, username } = props;

  const {
    error,
    isPending,
    mutateAsync: deleteUser,
    reset,
  } = useAccountUserDeleteMutation(username);

  const onClose = () => {
    reset(); // resets the error state of the useMutation
    _onClose();
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

  return (
    <Modal
      className={styles.removeAssignmentDialog}
      onModalClosed={onClose}
      open={open}
      role="dialog"
      size={error ? 'medium' : 'small'}
    >
      <span slot="title">{`Delete user?`}</span>
      <div slot="body">
        <NotificationBanner type="warning">
          <strong>Warning:</strong> Deleting <strong>{username}</strong> is
          permanent and can&apos;t be undone.
        </NotificationBanner>
        {error && <ErrorState />}
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
        <Button onClick={onDelete} processing={isPending} variant="primary">
          Delete User
        </Button>
      </div>
    </Modal>
  );
};

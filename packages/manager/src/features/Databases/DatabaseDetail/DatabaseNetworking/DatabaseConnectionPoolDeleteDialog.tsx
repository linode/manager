import { toast } from '@akamai/cds-components/notification-toast';
import {
  Button,
  Modal,
  NotificationBanner,
} from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import { getAPIErrorOrDefault } from '@akamai/compute-ui-core/api';
import { useDeleteDatabaseConnectionPoolMutation } from '@linode/queries';
import * as React from 'react';

interface Props {
  databaseId: number;
  onClose: () => void;
  open: boolean;
  poolLabel: string;
}

export const DatabaseConnectionPoolDeleteDialog = (props: Props) => {
  const { onClose, open, databaseId, poolLabel } = props;
  const {
    error,
    isPending,
    reset,
    mutateAsync: deleteConnectionPool,
  } = useDeleteDatabaseConnectionPoolMutation(databaseId, poolLabel);

  const onDelete = () => {
    deleteConnectionPool().then(() => {
      toast.open({
        text: `Connection Pool ${poolLabel} deleted successfully.`,
        type: 'success',
      });
      onClose();
    });
  };

  const clearErrorAndClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal closeModal={() => clearErrorAndClose()} open={open} size="small">
      <span slot="title">Delete Connection Pool {poolLabel}?</span>
      <div slot="body">
        {error ? (
          <NotificationBanner
            style={{ marginBottom: Spacing.S16 }}
            text={
              getAPIErrorOrDefault(
                error,
                'There was an error deleting this Connection Pool.'
              )[0].reason
            }
            type="error"
          />
        ) : null}
        <NotificationBanner
          style={{ marginBottom: Spacing.S16 }}
          type="warning"
        >
          <strong>Warning:</strong> Deletion will break the service URI for any
          clients using this pool.
        </NotificationBanner>
      </div>

      <div slot="actions" style={{ display: 'flex', alignItems: 'center' }}>
        <Button onClick={clearErrorAndClose} variant="link">
          Cancel
        </Button>
        <Button onClick={onDelete} processing={isPending} variant="danger">
          Delete Connection Pool
        </Button>
      </div>
    </Modal>
  );
};

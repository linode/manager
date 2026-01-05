import { useDeleteDatabaseConnectionPoolMutation } from '@linode/queries';
import { ActionsPanel, Notice } from '@linode/ui';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';

interface Props {
  databaseId: number;
  onClose: () => void;
  open: boolean;
  poolLabel: string;
}

export const DatabaseConnectionPoolDeleteDialog = (props: Props) => {
  const { onClose, open, databaseId, poolLabel } = props;
  const { enqueueSnackbar } = useSnackbar();
  const {
    error,
    isPending,
    reset,
    mutateAsync: deleteConnectionPool,
  } = useDeleteDatabaseConnectionPoolMutation(databaseId, poolLabel);

  const onDelete = () => {
    deleteConnectionPool().then(() => {
      enqueueSnackbar(`Connection Pool ${poolLabel} deleted successfully.`, {
        variant: 'success',
      });
      onClose();
    });
  };

  const clearErrorAndClose = () => {
    reset();
    onClose();
  };

  const actions = (
    <ActionsPanel
      primaryButtonProps={{
        label: 'Delete Connection Pool',
        loading: isPending,
        onClick: onDelete,
      }}
      secondaryButtonProps={{ label: 'Cancel', onClick: clearErrorAndClose }}
      style={{ padding: 0 }}
    />
  );

  return (
    <ConfirmationDialog
      actions={actions}
      error={error}
      onClose={() => clearErrorAndClose()}
      open={open}
      title={`Delete the ${poolLabel} Connection pool?`}
    >
      <Notice variant="warning">
        <strong>Warning:</strong> Deletion will break the service URI for any
        clients using this pool.
      </Notice>
    </ConfirmationDialog>
  );
};

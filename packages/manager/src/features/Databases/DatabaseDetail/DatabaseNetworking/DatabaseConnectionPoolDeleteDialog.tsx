import { useDeleteDatabaseConnectionPoolMutation } from '@linode/queries';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { TypeToConfirmDialog } from 'src/components/TypeToConfirmDialog/TypeToConfirmDialog';

interface Props {
  databaseId: number;
  onClose: () => void;
  open: boolean;
  poolName: string;
}

export const DatabaseConnectionPoolDeleteDialog = (props: Props) => {
  const { onClose, open, databaseId, poolName } = props;
  const { enqueueSnackbar } = useSnackbar();
  const {
    error,
    isPending,
    mutateAsync: deleteConnectionPool,
  } = useDeleteDatabaseConnectionPoolMutation(databaseId, poolName);

  const onDelete = () => {
    deleteConnectionPool().then(() => {
      enqueueSnackbar(`Connection Pool ${poolName} deleted successfully.`, {
        variant: 'success',
      });
      onClose();
    });
  };

  return (
    <TypeToConfirmDialog
      entity={{
        action: 'deletion',
        name: poolName,
        primaryBtnText: 'Delete',
        type: 'Database Connection Pool',
      }}
      errors={error}
      expand
      label="Database Connection Pool label"
      loading={isPending}
      onClick={onDelete}
      onClose={onClose}
      open={open}
      title={`Delete Database Connection Pool ${poolName}`}
    />
  );
};

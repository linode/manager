import { Database, DatabaseBackup } from '@linode/api-v4/lib/databases';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';
import { useDeleteBackupMutation } from 'src/queries/databases';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import formatDate from 'src/utilities/formatDate';
import TypeToConfirmDialog from 'src/components/TypeToConfirmDialog';

interface Props {
  open: boolean;
  onClose: () => void;
  database: Database;
  backup: DatabaseBackup;
}

export const DeleteBackupDialog = (props: Props) => {
  const { database, backup, onClose, open } = props;
  const { enqueueSnackbar } = useSnackbar();

  const {
    mutateAsync: manualDelete,
    isLoading,
    error,
  } = useDeleteBackupMutation(database.engine, database.id, backup.id);

  const handleDeleteBackup = () => {
    manualDelete().then(() => {
      enqueueSnackbar('Your backup is being deleted.', {
        variant: 'success',
      });
      onClose();
    });
  };

  return (
    <TypeToConfirmDialog
      title={`Delete Manual Backup ${formatDate(backup.created)}`}
      entity={{ type: 'Database Backup', label: formatDate(backup.created) }}
      confirmationText={
        <span>
          To confirm manual backup deletion, type the date of the manual backup
          (<strong>{formatDate(backup.created)}</strong>) from the{' '}
          <strong>{database.label}</strong> database in the field below.
        </span>
      }
      open={open}
      loading={isLoading}
      onClose={onClose}
      onClick={handleDeleteBackup}
      error={
        error
          ? getAPIErrorOrDefault(error, 'Unable to delete this backup.')[0]
              .reason
          : undefined
      }
    >
      <Notice warning>
        <Typography style={{ fontSize: '0.875rem' }}>
          <strong>Warning:</strong> Deleting a backup is irreversible. You are
          not deleting the database cluster itself with this action. Deleting a
          manual backup frees up space that counts toward the limit of 3.
        </Typography>
      </Notice>
    </TypeToConfirmDialog>
  );
};

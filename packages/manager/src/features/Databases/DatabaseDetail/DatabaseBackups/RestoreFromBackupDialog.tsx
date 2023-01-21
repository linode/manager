import { Database, DatabaseBackup } from '@linode/api-v4/lib/databases';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { useRestoreFromBackupMutation } from 'src/queries/databases';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import formatDate from 'src/utilities/formatDate';
import { DatabaseBackupType } from '@linode/api-v4/lib/databases/types';
import TypeToConfirmDialog from 'src/components/TypeToConfirmDialog';
import Notice from 'src/components/Notice';
import Typography from 'src/components/core/Typography';

interface Props {
  open: boolean;
  onClose: () => void;
  database: Database;
  backup: DatabaseBackup;
}

interface BackupDialogData {
  title: string;
  confirmationText: JSX.Element;
  label: string;
}
export const RestoreFromBackupDialog = (props: Props) => {
  const { database, backup, onClose, open } = props;

  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();

  const {
    mutateAsync: restore,
    isLoading,
    error,
  } = useRestoreFromBackupMutation(database.engine, database.id, backup.id);

  const backupDialogMap: Record<DatabaseBackupType, BackupDialogData> = {
    snapshot: {
      title: `Restore Manual Backup ${formatDate(backup.created)}`,
      confirmationText: (
        <span>
          To confirm manual backup restoration, type the date of the manual
          backup (<strong>{formatDate(backup.created)}</strong>) from the{' '}
          <strong>{database.label}</strong> database in the field below.
        </span>
      ),
      label: `Manual backup date from  ${database.label}`,
    },
    auto: {
      title: `Restore Automatic Backup ${formatDate(backup.created)}`,
      confirmationText: (
        <span>
          To confirm automatic backup restoration, type the date of the
          automatic backup (<strong>{formatDate(backup.created)}</strong>) from
          the <strong>{database.label}</strong> database in the field below.
        </span>
      ),
      label: `Automatic backup date from  ${database.label}`,
    },
  };

  const handleRestoreDatabase = () => {
    restore().then(() => {
      history.push('summary');
      enqueueSnackbar('Your database is being restored.', {
        variant: 'success',
      });
      onClose();
    });
  };

  return (
    <TypeToConfirmDialog
      title={backupDialogMap[backup.type].title}
      entity={{ type: 'Database Backup', label: formatDate(backup.created) }}
      open={open}
      confirmationText={backupDialogMap[backup.type].confirmationText}
      loading={isLoading}
      onClose={onClose}
      onClick={handleRestoreDatabase}
      error={
        error
          ? getAPIErrorOrDefault(error, 'Unable to delete this backup.')[0]
              .reason
          : undefined
      }
    >
      <Notice warning>
        <Typography style={{ fontSize: '0.875rem' }}>
          <strong>Warning:</strong> Restoring from a backup will erase all
          existing data on this cluster.
        </Typography>
      </Notice>
    </TypeToConfirmDialog>
  );
};

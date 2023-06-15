import { Database, DatabaseBackup } from '@linode/api-v4/lib/databases';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { TypeToConfirmDialog } from 'src/components/TypeToConfirmDialog/TypeToConfirmDialog';
import { DialogProps } from 'src/components/Dialog/Dialog';
import { Notice } from 'src/components/Notice/Notice';
import Typography from 'src/components/core/Typography';
import { useRestoreFromBackupMutation } from 'src/queries/databases';
import { useProfile } from 'src/queries/profile';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import formatDate from 'src/utilities/formatDate';

interface Props extends Omit<DialogProps, 'title'> {
  open: boolean;
  onClose: () => void;
  database: Database;
  backup: DatabaseBackup;
}

export const RestoreFromBackupDialog: React.FC<Props> = (props) => {
  const { database, backup, onClose, open } = props;
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();
  const { data: profile } = useProfile();

  const {
    mutateAsync: restore,
    isLoading,
    error,
  } = useRestoreFromBackupMutation(database.engine, database.id, backup.id);

  const handleRestoreDatabase = (
    e: React.MouseEvent<HTMLButtonElement>
  ): void => {
    e.preventDefault();
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
      title={`Restore from Backup ${formatDate(backup.created, {
        timezone: profile?.timezone,
      })}`}
      label={'Database Label'}
      entity={{
        type: 'Database',
        subType: 'Cluster',
        action: 'restoration',
        name: database.label,
        primaryBtnText: 'Restore',
      }}
      open={open}
      onClose={onClose}
      onClick={() => handleRestoreDatabase}
      loading={isLoading}
    >
      {error ? (
        <Notice
          error
          text={
            getAPIErrorOrDefault(error, 'Unable to restore this backup.')[0]
              .reason
          }
        />
      ) : null}
      <Notice warning>
        <Typography style={{ fontSize: '0.875rem' }}>
          <strong>Warning:</strong> Restoring from a backup will erase all
          existing data on this cluster.
        </Typography>
      </Notice>
    </TypeToConfirmDialog>
  );
};

export default RestoreFromBackupDialog;

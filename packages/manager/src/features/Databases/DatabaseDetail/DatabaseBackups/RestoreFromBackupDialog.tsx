import { Database, DatabaseBackup } from '@linode/api-v4/lib/databases';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { DialogProps } from 'src/components/Dialog/Dialog';
import { Notice } from 'src/components/Notice/Notice';
import { TypeToConfirmDialog } from 'src/components/TypeToConfirmDialog/TypeToConfirmDialog';
import { Typography } from 'src/components/Typography';
import { useRestoreFromBackupMutation } from 'src/queries/databases';
import { useProfile } from 'src/queries/profile';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { formatDate } from 'src/utilities/formatDate';

interface Props extends Omit<DialogProps, 'title'> {
  backup: DatabaseBackup;
  database: Database;
  onClose: () => void;
  open: boolean;
}

export const RestoreFromBackupDialog: React.FC<Props> = (props) => {
  const { backup, database, onClose, open } = props;
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();
  const { data: profile } = useProfile();

  const {
    error,
    isLoading,
    mutateAsync: restore,
  } = useRestoreFromBackupMutation(database.engine, database.id, backup.id);

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
      entity={{
        action: 'restoration',
        name: database.label,
        primaryBtnText: 'Restore Database',
        subType: 'Cluster',
        type: 'Database',
      }}
      title={`Restore from Backup ${formatDate(backup.created, {
        timezone: profile?.timezone,
      })}`}
      label={'Database Label'}
      loading={isLoading}
      onClick={handleRestoreDatabase}
      onClose={onClose}
      open={open}
    >
      {error ? (
        <Notice
          text={
            getAPIErrorOrDefault(error, 'Unable to restore this backup.')[0]
              .reason
          }
          variant="error"
        />
      ) : null}
      <Notice variant="warning">
        <Typography style={{ fontSize: '0.875rem' }}>
          <strong>Warning:</strong> Restoring from a backup will erase all
          existing data on this cluster.
        </Typography>
      </Notice>
    </TypeToConfirmDialog>
  );
};

export default RestoreFromBackupDialog;

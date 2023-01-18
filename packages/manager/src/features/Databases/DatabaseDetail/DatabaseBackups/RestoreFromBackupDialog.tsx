import { Database, DatabaseBackup } from '@linode/api-v4/lib/databases';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import TypeToConfirm from 'src/components/TypeToConfirm';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';
import { useRestoreFromBackupMutation } from 'src/queries/databases';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import formatDate from 'src/utilities/formatDate';
import usePreferences from 'src/hooks/usePreferences';

interface Props {
  open: boolean;
  onClose: () => void;
  database: Database;
  backup: DatabaseBackup;
}

export const RestoreFromBackupDialog = (props: Props) => {
  const { database, backup, onClose, open } = props;

  const { preferences } = usePreferences();

  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();

  const [confirmationText, setConfirmationText] = React.useState('');

  const {
    mutateAsync: restore,
    isLoading,
    error,
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

  React.useEffect(() => {
    if (open) {
      setConfirmationText('');
    }
  }, [open]);

  const actions = (
    <ActionsPanel style={{ padding: 0 }}>
      <Button buttonType="secondary" onClick={onClose}>
        Cancel
      </Button>
      <Button
        buttonType="primary"
        onClick={handleRestoreDatabase}
        disabled={
          preferences?.type_to_confirm !== false
            ? backup.type === 'snapshot'
              ? confirmationText !== backup.label
              : confirmationText !== formatDate(backup.created)
            : false
        }
        loading={isLoading}
      >
        Restore Database
      </Button>
    </ActionsPanel>
  );

  return (
    <ConfirmationDialog
      title={`Restore from Backup ${formatDate(backup.created)}`}
      open={open}
      onClose={onClose}
      actions={actions}
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
      <TypeToConfirm
        confirmationText={
          backup.type === 'snapshot' ? (
            <span>
              To confirm restoration, type the name of the manual backup (
              <strong>{backup.label}</strong>) from the{' '}
              <strong>{database.label}</strong> database in the field below.
            </span>
          ) : (
            <span>
              To confirm restoration, type the date of the automatic backup (
              <strong>{formatDate(backup.created)}</strong>) from the{' '}
              <strong>{database.label}</strong> database in the field below.
            </span>
          )
        }
        onChange={(input) => setConfirmationText(input)}
        value={confirmationText}
        label={
          backup.type === 'snapshot'
            ? `Backup name from ${database.label}`
            : `Backup date from ${database.label}`
        }
        visible={preferences?.type_to_confirm}
        placeholder={
          backup.type === 'snapshot' ? backup.label : formatDate(backup.created)
        }
      />
    </ConfirmationDialog>
  );
};

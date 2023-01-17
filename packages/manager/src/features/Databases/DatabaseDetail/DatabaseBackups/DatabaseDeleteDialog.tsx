import { Database, DatabaseBackup } from '@linode/api-v4/lib/databases';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import TypeToConfirm from 'src/components/TypeToConfirm';
import Typography from 'src/components/core/Typography';
import { DialogProps } from 'src/components/Dialog';
import Notice from 'src/components/Notice';
import usePreferences from 'src/hooks/usePreferences';
import { useDeleteBackupMutation } from 'src/queries/databases';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import formatDate from 'src/utilities/formatDate';

interface Props extends Omit<DialogProps, 'title'> {
  open: boolean;
  onClose: () => void;
  database: Database;
  backup: DatabaseBackup;
}

export const DatabaseDeleteDialog: React.FC<Props> = (props) => {
  const { preferences } = usePreferences();
  const { database, backup, onClose, open, ...rest } = props;
  const { enqueueSnackbar } = useSnackbar();

  const [confirmationText, setConfirmationText] = React.useState('');

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

  const actions = (
    <ActionsPanel style={{ padding: 0 }}>
      <Button buttonType="secondary" onClick={onClose}>
        Cancel
      </Button>
      <Button
        buttonType="primary"
        onClick={handleDeleteBackup}
        disabled={
          preferences?.type_to_confirm !== false
            ? backup.type === 'snapshot'
              ? confirmationText !== backup.label
              : confirmationText !== formatDate(backup.created)
            : false
        }
        loading={isLoading}
      >
        Delete Backup
      </Button>
    </ActionsPanel>
  );

  React.useEffect(() => {
    if (open) {
      setConfirmationText('');
    }
  }, [open]);

  return (
    <ConfirmationDialog
      {...rest}
      title={`Delete Backup ${
        backup.type === 'snapshot' ? backup.label : formatDate(backup.created)
      }`}
      open={open}
      onClose={onClose}
      actions={actions}
    >
      {error ? (
        <Notice
          error
          text={
            getAPIErrorOrDefault(error, 'Unable to delete this backup.')[0]
              .reason
          }
        />
      ) : null}
      <Notice warning>
        <Typography style={{ fontSize: '0.875rem' }}>
          <strong>Warning:</strong> Deleting a backup is irreversible. You are
          not deleting the database cluster itself with this action. Deleting an
          automatic backup does not count toward the manual backup limit.
        </Typography>
      </Notice>
      <TypeToConfirm
        confirmationText={
          backup.type === 'snapshot' ? (
            <span>
              To confirm deletion, type the name of the manual backup (
              <strong>{backup.label}</strong>) from the{' '}
              <strong>{database.label}</strong> database in the field below.
            </span>
          ) : (
            <span>
              To confirm deletion, type the date of the automatic backup (
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

export default DatabaseDeleteDialog;

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
          preferences?.type_to_confirm !== false &&
          confirmationText !== formatDate(backup.created)
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
      title={`Delete Manual Backup ${formatDate(backup.created)}`}
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
          not deleting the database cluster itself with this action. Deleting a
          manual backup frees up space that counts toward the limit of 3.
        </Typography>
      </Notice>
      <TypeToConfirm
        confirmationText={
          <span>
            To confirm deletion, type the date/time of the manual backup from (
            <strong>{database.label}</strong>) in the field below.
          </span>
        }
        onChange={(input) => setConfirmationText(input)}
        value={confirmationText}
        label={`Manual backup date from ${database.label}`}
        visible={preferences?.type_to_confirm}
        placeholder={formatDate(backup.created)}
      />
    </ConfirmationDialog>
  );
};

export default DatabaseDeleteDialog;

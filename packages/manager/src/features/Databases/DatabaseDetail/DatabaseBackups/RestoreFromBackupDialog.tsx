import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Typography from 'src/components/core/Typography';
import { DialogProps } from 'src/components/Dialog';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import {
  CreateDatabaseResponse,
  DatabaseBackup,
} from '@linode/api-v4/lib/databases';
import formatDate from 'src/utilities/formatDate';
import { useRestoreFromBackupMutation } from 'src/queries/databases';
import { useSnackbar } from 'notistack';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

interface Props extends Omit<DialogProps, 'title'> {
  open: boolean;
  onClose: () => void;
  database: CreateDatabaseResponse;
  backup: DatabaseBackup;
}

export const RestoreFromBackupDialog: React.FC<Props> = (props) => {
  const { database, backup, onClose, open, ...rest } = props;

  const { enqueueSnackbar } = useSnackbar();

  const [confirmationText, setConfirmationText] = React.useState('');

  const {
    mutateAsync: restore,
    isLoading,
    error,
  } = useRestoreFromBackupMutation(database.engine, database.id, backup.id);

  const onRestore = () => {
    restore().then(() => {
      enqueueSnackbar('Your database has been scheduled to be restored.', {
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
        onClick={onRestore}
        disabled={confirmationText !== database.label}
        loading={isLoading}
      >
        Restore Database
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
      title={`Restore from Backup ${formatDate(backup.created)}`}
      open={open}
      onClose={onClose}
      actions={actions}
    >
      {error && (
        <Notice
          error
          text={
            getAPIErrorOrDefault(error, 'Unable to restore this backup.')[0]
              .reason
          }
        />
      )}
      <Notice
        warning
        text="Restoring from a backup will erace all existing data on this cluster."
      />
      <Typography>
        To confirm restoring from a backup, type the name of the database
        cluster (<strong>{database.label}</strong>) in the field below.
      </Typography>
      <TextField
        label="Database Label"
        value={confirmationText}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setConfirmationText(e.target.value)
        }
        placeholder={database.label}
      />
    </ConfirmationDialog>
  );
};

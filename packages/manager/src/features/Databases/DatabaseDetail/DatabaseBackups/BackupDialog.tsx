import * as React from 'react';
import TextField from 'src/components/TextField';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import { useSnackbar } from 'notistack';
import { useBackupMutation } from 'src/queries/databases';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { Database } from '@linode/api-v4/lib/databases';

interface Props {
  open: boolean;
  onClose: () => void;
  database: Database;
}

export const BackupDialog = (props: Props) => {
  const { database, onClose, open } = props;
  const { enqueueSnackbar } = useSnackbar();

  const [backupLabel, setBackupLabel] = React.useState('');

  const { mutateAsync: backup, isLoading, error } = useBackupMutation(
    database.engine,
    database.id,
    backupLabel
  );

  const handleBackupDatabase = () => {
    backup().then(() => {
      enqueueSnackbar(
        `${database.label} is being backed up with label ${backupLabel}`,
        {
          variant: 'success',
        }
      );
      onClose();
    });
  };

  React.useEffect(() => {
    if (open) {
      setBackupLabel('');
    }
  }, [open]);

  const actions = (
    <ActionsPanel style={{ padding: 0 }}>
      <Button buttonType="secondary" onClick={onClose}>
        Cancel
      </Button>
      <Button
        buttonType="primary"
        onClick={handleBackupDatabase}
        disabled={!backupLabel}
        loading={isLoading}
      >
        Backup Database
      </Button>
    </ActionsPanel>
  );

  return (
    <ConfirmationDialog
      title={`Backup ${database.label}`}
      open={open}
      onClose={onClose}
      actions={actions}
      error={
        error
          ? getAPIErrorOrDefault(error, 'Unable to create this backup.')[0]
              .reason
          : undefined
      }
    >
      <TextField
        onChange={(e) => setBackupLabel(e.target.value)}
        value={backupLabel}
        label="Backup Label"
        placeholder={'My backup label'}
      />
    </ConfirmationDialog>
  );
};

export default BackupDialog;

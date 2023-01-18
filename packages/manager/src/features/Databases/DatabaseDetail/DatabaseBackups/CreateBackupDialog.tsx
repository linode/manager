import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import { useSnackbar } from 'notistack';
import { useBackupMutation } from 'src/queries/databases';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { Database } from '@linode/api-v4/lib/databases';
import Typography from 'src/components/core/Typography';
import { generateManualBackupLabel } from 'src/features/Databases/databaseUtils';

interface Props {
  open: boolean;
  onClose: () => void;
  database: Database;
}

export const CreateBackupDialog = (props: Props) => {
  const { database, onClose, open } = props;
  const { enqueueSnackbar } = useSnackbar();
  const backupLabel = generateManualBackupLabel();

  const { mutateAsync: backup, isLoading, error } = useBackupMutation(
    database.engine,
    database.id,
    backupLabel
  );
  const handleBackupDatabase = () => {
    backup().then(() => {
      enqueueSnackbar(`${database.label} is being manually backed up`, {
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
        onClick={() => handleBackupDatabase()}
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
      <Typography>
        Would you like to perform a manual backup of this database? When you
        reach 3 manual backups, please delete an existing one before adding
        another.
      </Typography>
    </ConfirmationDialog>
  );
};

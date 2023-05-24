import { Database, DatabaseBackup } from '@linode/api-v4/lib/databases';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { DialogProps } from 'src/components/Dialog/Dialog';
import { Notice } from 'src/components/Notice/Notice';
import { TypeToConfirm } from 'src/components/TypeToConfirm/TypeToConfirm';
import Typography from 'src/components/core/Typography';
import { useRestoreFromBackupMutation } from 'src/queries/databases';
import { usePreferences } from 'src/queries/preferences';
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
  const { database, backup, onClose, open, ...rest } = props;

  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();

  const [confirmationText, setConfirmationText] = React.useState('');

  const { data: preferences } = usePreferences();
  const { data: profile } = useProfile();

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

  const actions = (
    <ActionsPanel style={{ padding: 0 }}>
      <Button buttonType="secondary" onClick={onClose}>
        Cancel
      </Button>
      <Button
        buttonType="primary"
        onClick={handleRestoreDatabase}
        disabled={
          preferences?.type_to_confirm !== false &&
          confirmationText !== database.label
        }
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
      title={`Restore from Backup ${formatDate(backup.created, {
        timezone: profile?.timezone,
      })}`}
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
          <span>
            To confirm restoration, type the name of the database cluster (
            <strong>{database.label}</strong>) in the field below.
          </span>
        }
        onChange={(input) => setConfirmationText(input)}
        value={confirmationText}
        label="Database Label"
        visible={preferences?.type_to_confirm}
        placeholder={database.label}
      />
    </ConfirmationDialog>
  );
};

export default RestoreFromBackupDialog;

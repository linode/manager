import { Database, DatabaseBackup } from '@linode/api-v4/lib/databases';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { compose } from 'recompose';
import { useHistory } from 'react-router-dom';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import TypeToConfirm from 'src/components/TypeToConfirm';
import Typography from 'src/components/core/Typography';
import { DialogProps } from 'src/components/Dialog';
import Notice from 'src/components/Notice';
import withPreferences, {
  Props as PreferencesProps,
} from 'src/containers/preferences.container';
import { useRestoreFromBackupMutation } from 'src/queries/databases';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import formatDate from 'src/utilities/formatDate';

interface Props extends Omit<DialogProps, 'title'> {
  open: boolean;
  onClose: () => void;
  database: Database;
  backup: DatabaseBackup;
}

export type CombinedProps = Props & PreferencesProps;

export const RestoreFromBackupDialog: React.FC<CombinedProps> = (props) => {
  const { database, backup, preferences, onClose, open, ...rest } = props;

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
          confirmationText !== formatDate(backup.created)
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
      title={
        backup.type === 'snapshot'
          ? `Restore Manual Backup ${formatDate(backup.created)}`
          : `Restore Automatic Backup ${formatDate(backup.created)}`
      }
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
              To confirm manual backup restoration, type the date/time of the
              manual backup (<strong>{formatDate(backup.created)}</strong>) from
              the <strong>{database.label}</strong> database in the field below.
            </span>
          ) : (
            <span>
              To confirm automatic backup restoration, type the date/time of the
              automatic backup (<strong>{formatDate(backup.created)}</strong>)
              from the <strong>{database.label}</strong> database in the field
              below.
            </span>
          )
        }
        onChange={(input) => setConfirmationText(input)}
        value={confirmationText}
        label={
          backup.type === 'snapshot'
            ? `Manual backup date from  ${database.label}`
            : `Automatic backup date from  ${database.label}`
        }
        visible={preferences?.type_to_confirm}
        placeholder={formatDate(backup.created)}
      />
    </ConfirmationDialog>
  );
};

const enhanced = compose<CombinedProps, Props>(withPreferences());

export default enhanced(RestoreFromBackupDialog);

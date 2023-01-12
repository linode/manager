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
import { useDeleteBackupMutation } from 'src/queries/databases';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import formatDate from 'src/utilities/formatDate';

interface Props extends Omit<DialogProps, 'title'> {
  open: boolean;
  onClose: () => void;
  database: Database;
  backup: DatabaseBackup;
}

export type CombinedProps = Props & PreferencesProps;

export const DatabaseDeleteDialog: React.FC<CombinedProps> = (props) => {
  const { database, backup, preferences, onClose, open, ...rest } = props;

  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();

  const [confirmationText, setConfirmationText] = React.useState('');

  const {
    mutateAsync: manualDelete,
    isLoading,
    error,
  } = useDeleteBackupMutation(database.engine, database.id, backup.id);

  const handleDeleteBackup = () => {
    manualDelete().then(() => {
      history.push('summary');
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
          confirmationText !== database.label
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
      title={`Delete Backup ${formatDate(backup.created)}`}
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
          not deleting the database cluster itself with this action.
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

const enhanced = compose<CombinedProps, Props>(withPreferences());

export default enhanced(DatabaseDeleteDialog);

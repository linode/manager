import { Database } from '@linode/api-v4/lib/databases';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { compose } from 'recompose';
import { useHistory } from 'react-router-dom';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import TypeToConfirm from 'src/components/TypeToConfirm';
import { DialogProps } from 'src/components/Dialog';
import Notice from 'src/components/Notice';
import withPreferences, {
  Props as PreferencesProps,
} from 'src/containers/preferences.container';
import { useBackupMutation } from 'src/queries/databases';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

interface Props extends Omit<DialogProps, 'title'> {
  open: boolean;
  onClose: () => void;
  database: Database;
}

export type CombinedProps = Props & PreferencesProps;

export const BackupDialog: React.FC<CombinedProps> = (props) => {
  const { database, preferences, onClose, open, ...rest } = props;

  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();

  const [backupLabel, setBackupLabel] = React.useState('');

  const { mutateAsync: backup, isLoading, error } = useBackupMutation(
    database.engine,
    database.id,
    backupLabel
  );
  const handleBackupDatabase = (backupLabel: string) => {
    backup().then(() => {
      history.push('summary');
      enqueueSnackbar(
        `${database.label} is being backed up with label ${backupLabel}`,
        {
          variant: 'success',
        }
      );
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
        onClick={() => handleBackupDatabase(backupLabel)}
        disabled={preferences?.type_to_confirm !== false && backupLabel === ''}
        loading={isLoading}
      >
        Backup Database
      </Button>
    </ActionsPanel>
  );

  React.useEffect(() => {
    if (open) {
      setBackupLabel('');
    }
  }, [open]);

  return (
    <ConfirmationDialog
      {...rest}
      title={`Backup ${database.label}`}
      open={open}
      onClose={onClose}
      actions={actions}
    >
      {error ? (
        <Notice
          error
          text={
            getAPIErrorOrDefault(error, 'Unable to create this backup.')[0]
              .reason
          }
        />
      ) : null}
      <TypeToConfirm
        backupLabel={
          <span>
            To backup <strong>{database.label}</strong>, give your backup a name
            in the field below.
          </span>
        }
        onChange={(input) => setBackupLabel(input)}
        value={backupLabel}
        label="Backup Label"
        visible={true}
        placeholder={'My backup label'}
        hideInstructions={true}
      />
    </ConfirmationDialog>
  );
};

const enhanced = compose<CombinedProps, Props>(withPreferences());

export default enhanced(BackupDialog);

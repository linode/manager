import { Database } from '@linode/api-v4/lib/databases';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { compose } from 'recompose';
import { useHistory } from 'react-router-dom';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import { DialogProps } from 'src/components/Dialog';
import Notice from 'src/components/Notice';
import withPreferences, {
  Props as PreferencesProps,
} from 'src/containers/preferences.container';
import { useBackupMutation } from 'src/queries/databases';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import Typography from 'src/components/core/Typography';
import { generateManualBackupLabel } from 'src/features/Databases/databaseUtils';

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

  const { mutateAsync: backup, isLoading, error } = useBackupMutation(
    database.engine,
    database.id,
    generateManualBackupLabel()
  );
  const handleBackupDatabase = () => {
    backup().then(() => {
      history.push('summary');
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
      <Typography>
        Would you like to perform a manual backup of this database? When you
        reach 3 manual backups, please delete an existing one before adding
        another.
      </Typography>
    </ConfirmationDialog>
  );
};

const enhanced = compose<CombinedProps, Props>(withPreferences());

export default enhanced(BackupDialog);

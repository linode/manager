import * as React from 'react';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import { Engine } from '@linode/api-v4/lib/databases';
import { useDeleteDatabaseMutation } from 'src/queries/databases';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { useSnackbar } from 'notistack';
import Notice from 'src/components/Notice';
import Typography from 'src/components/core/Typography';
import TextField from 'src/components/TextField';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import { useHistory } from 'react-router-dom';

interface Props {
  open: boolean;
  onClose: () => void;
  databaseID: number;
  databaseEngine: Engine;
  databaseLabel: string;
}

const renderActions = (
  disabled: boolean,
  loading: boolean,
  onClose: () => void,
  onDelete: () => void
) => (
  <ActionsPanel>
    <Button
      buttonType="secondary"
      onClick={onClose}
      data-qa-cancel
      data-testid={'dialog-cancel'}
    >
      Cancel
    </Button>
    <Button
      buttonType="primary"
      onClick={onDelete}
      disabled={disabled}
      loading={loading}
      data-qa-cancel
      data-testid={'dialog-confirm'}
    >
      Delete Cluster
    </Button>
  </ActionsPanel>
);

export const DatabaseSettingsDeleteClusterDialog: React.FC<Props> = (props) => {
  const { open, onClose, databaseID, databaseEngine, databaseLabel } = props;
  const { enqueueSnackbar } = useSnackbar();
  const { mutateAsync: deleteDatabase } = useDeleteDatabaseMutation(
    databaseEngine,
    databaseID
  );
  const defaultError = 'There was an error deleting this database cluster';
  const [error, setError] = React.useState('');
  const [confirmText, setConfirmText] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const { push } = useHistory();
  const disabled = confirmText !== databaseLabel;

  const onDeleteCluster = () => {
    setIsLoading(true);
    deleteDatabase()
      .then(() => {
        setIsLoading(false);
        enqueueSnackbar('Database Cluster deleted successfully', {
          variant: 'success',
        });
        onClose();
        push('/databases');
      })
      .catch((e) => {
        setIsLoading(false);
        setError(getAPIErrorOrDefault(e, defaultError)[0].reason);
      });
  };

  return (
    <ConfirmationDialog
      title={`Delete Database Cluster ${databaseLabel}`}
      open={open}
      error={error}
      onClose={onClose}
      actions={renderActions(disabled, isLoading, onClose, onDeleteCluster)}
    >
      <Notice warning>
        <Typography style={{ fontSize: '0.875rem' }}>
          <strong>Warning</strong>: Deleting your entire database will delete a
          any backups and nodes associated with database {databaseLabel}, which
          may result in permanent data loss. This action cannot be undone.
        </Typography>
      </Notice>
      <Typography style={{ marginTop: '10px' }}>
        To confirm deletion, type the name of the database cluster (
        <b>{databaseLabel}</b>) in the field below:
      </Typography>
      <TextField
        data-testid={'dialog-confirm-text-input'}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setConfirmText(e.target.value)
        }
        label="Cluster Name"
        expand
      />
    </ConfirmationDialog>
  );
};

export default DatabaseSettingsDeleteClusterDialog;

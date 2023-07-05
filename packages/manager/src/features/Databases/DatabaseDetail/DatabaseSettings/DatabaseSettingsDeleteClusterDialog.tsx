import { Engine } from '@linode/api-v4/lib/databases';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import ActionsPanel from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Typography } from 'src/components/Typography';
import { Notice } from 'src/components/Notice/Notice';
import { TypeToConfirm } from 'src/components/TypeToConfirm/TypeToConfirm';
import { useDeleteDatabaseMutation } from 'src/queries/databases';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { usePreferences } from 'src/queries/preferences';

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
  <ActionsPanel
    primary
    primaryButtonDataTestId="cancel"
    primaryButtonDisabled={disabled}
    primaryButtonHandler={onDelete}
    primaryButtonLoading={loading}
    primaryButtonText="Delete Cluster"
    secondary
    secondaryButtonDataTestId="cancel"
    secondaryButtonHandler={onClose}
    secondaryButtonText="Cancel"
  />
);

export const DatabaseSettingsDeleteClusterDialog: React.FC<Props> = (props) => {
  const { open, onClose, databaseID, databaseEngine, databaseLabel } = props;
  const { enqueueSnackbar } = useSnackbar();
  const { data: preferences } = usePreferences();
  const { mutateAsync: deleteDatabase } = useDeleteDatabaseMutation(
    databaseEngine,
    databaseID
  );
  const defaultError = 'There was an error deleting this Database Cluster.';
  const [error, setError] = React.useState('');
  const [confirmText, setConfirmText] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const { push } = useHistory();
  const disabled =
    preferences?.type_to_confirm !== false && confirmText !== databaseLabel;

  const onDeleteCluster = () => {
    setIsLoading(true);
    deleteDatabase()
      .then(() => {
        setIsLoading(false);
        enqueueSnackbar('Database Cluster deleted successfully.', {
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
          <strong>Warning:</strong> Deleting your entire database will delete
          any backups and nodes associated with database {databaseLabel}, which
          may result in permanent data loss. This action cannot be undone.
        </Typography>
      </Notice>
      <TypeToConfirm
        data-testid={'dialog-confirm-text-input'}
        label="Cluster Name"
        onChange={(input) => setConfirmText(input)}
        expand
        value={confirmText}
        confirmationText={
          <span>
            To confirm deletion, type the name of the database cluster (
            <b>{databaseLabel}</b>) in the field below:
          </span>
        }
        visible={preferences?.type_to_confirm}
      />
    </ConfirmationDialog>
  );
};

export default DatabaseSettingsDeleteClusterDialog;

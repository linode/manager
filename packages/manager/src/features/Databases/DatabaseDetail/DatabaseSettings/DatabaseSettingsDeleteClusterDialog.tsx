import { Engine } from '@linode/api-v4/lib/databases';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import Typography from 'src/components/core/Typography';
import { Notice } from 'src/components/Notice/Notice';
import { TypeToConfirmDialog } from 'src/components/TypeToConfirmDialog/TypeToConfirmDialog';
import { useDeleteDatabaseMutation } from 'src/queries/databases';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
// import Button from 'src/components/Button';
// import ActionsPanel from 'src/components/ActionsPanel';
// import { TypeToConfirm } from 'src/components/TypeToConfirm/TypeToConfirm';
// import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
// import { usePreferences } from 'src/queries/preferences';

interface Props {
  open: boolean;
  onClose: () => void;
  databaseID: number;
  databaseEngine: Engine;
  databaseLabel: string;
}

// const renderActions = (
//   disabled: boolean,
//   loading: boolean,
//   onClose: () => void,
//   onDelete: () => void
// ) => (
//   <ActionsPanel>
//     <Button
//       buttonType="secondary"
//       onClick={onClose}
//       data-qa-cancel
//       data-testid={'dialog-cancel'}
//     >
//       Cancel
//     </Button>
//     <Button
//       buttonType="primary"
//       onClick={onDelete}
//       disabled={disabled}
//       loading={loading}
//       data-qa-cancel
//       data-testid={'dialog-confirm'}
//     >
//       Delete Cluster
//     </Button>
//   </ActionsPanel>
// );

export const DatabaseSettingsDeleteClusterDialog: React.FC<Props> = (props) => {
  const { open, onClose, databaseID, databaseEngine, databaseLabel } = props;
  const { enqueueSnackbar } = useSnackbar();
  const { mutateAsync: deleteDatabase } = useDeleteDatabaseMutation(
    databaseEngine,
    databaseID
  );
  const defaultError = 'There was an error deleting this Database Cluster.';
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const { push } = useHistory();
  // const { data: preferences } = usePreferences();
  // const [confirmText, setConfirmText] = React.useState('');
  // const disabled =
  //   preferences?.type_to_confirm !== false && confirmText !== databaseLabel;

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
    // <ConfirmationDialog
    //   title={`Delete Database Cluster ${databaseLabel}`}
    //   open={open}
    //   error={error}
    //   onClose={onClose}
    //   actions={renderActions(disabled, isLoading, onClose, onDeleteCluster)}
    // >
    //   <Notice warning>
    //     <Typography style={{ fontSize: '0.875rem' }}>
    //       <strong>Warning:</strong> Deleting your entire database will delete
    //       any backups and nodes associated with database {databaseLabel}, which
    //       may result in permanent data loss. This action cannot be undone.
    //     </Typography>
    //   </Notice>
    //   <TypeToConfirm
    //     data-testid={'dialog-confirm-text-input'}
    //     label="Cluster Name"
    //     onChange={(input) => setConfirmText(input)}
    //     expand
    //     value={confirmText}
    //     confirmationText={
    //       <span>
    //         To confirm deletion, type the name of the database cluster (
    //         <b>{databaseLabel}</b>) in the field below:
    //       </span>
    //     }
    //     visible={preferences?.type_to_confirm}
    //   />
    // </ConfirmationDialog>

    <TypeToConfirmDialog
      title={`Delete Database Cluster ${databaseLabel}`}
      entity={{ type: 'Cluster', label: databaseLabel }}
      open={open}
      onClose={onClose}
      onClick={onDeleteCluster}
      loading={isLoading}
      error={error}
    >
      <Notice warning>
        <Typography style={{ fontSize: '0.875rem' }}>
          <strong>Warning:</strong> Deleting your entire database will delete
          any backups and nodes associated with database {databaseLabel}, which
          may result in permanent data loss. This action cannot be undone.
        </Typography>
      </Notice>
    </TypeToConfirmDialog>
  );
};

export default DatabaseSettingsDeleteClusterDialog;

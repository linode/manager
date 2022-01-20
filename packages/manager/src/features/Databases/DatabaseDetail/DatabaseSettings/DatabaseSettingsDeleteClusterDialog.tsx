import * as React from 'react';
import DeletionDialog from 'src/components/DeletionDialog';
import { Engine } from '@linode/api-v4/lib/databases';
import { useDeleteDatabaseMutation } from 'src/queries/databases';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { useSnackbar } from 'notistack';

interface Props {
  open: boolean;
  onClose: () => void;
  databaseID: number;
  databaseEngine: Engine;
  databaseLabel: string;
}

export const DatabaseSettingsDeleteClusterDialog: React.FC<Props> = (props) => {
  const { open, onClose, databaseID, databaseEngine, databaseLabel} = props;
  const { enqueueSnackbar } = useSnackbar();
  const { mutateAsync: deleteDatabase } = useDeleteDatabaseMutation(
    databaseEngine,
    databaseID
  );
  const defaultError = 'There was an error deleting this database cluster';
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const onDeleteCluster = () => {
    setIsLoading(true);
    deleteDatabase()
      .then(() => {
        setIsLoading(false);
        enqueueSnackbar('Database Cluster deleted successfully', {
          variant: 'success',
        });
      })
      .catch((e) => {
        setIsLoading(false);
        setError(getAPIErrorOrDefault(e, defaultError)[0].reason);
      });
  };

  return (
    <DeletionDialog
      entity="Database Cluster"
      label={databaseLabel}
      open={open}
      error={error}
      onClose={onClose}
      onDelete={onDeleteCluster}
      loading={isLoading}
    />
  );
};

export default DatabaseSettingsDeleteClusterDialog;

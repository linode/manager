import { Notice, Typography } from '@linode/ui';
import { useNavigate } from '@tanstack/react-router';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { TypeToConfirmDialog } from 'src/components/TypeToConfirmDialog/TypeToConfirmDialog';
import { useDeleteDatabaseMutation } from 'src/queries/databases/databases';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import type { Engine } from '@linode/api-v4/lib/databases';

interface Props {
  databaseEngine: Engine;
  databaseID: number;
  databaseLabel: string;
  onClose: () => void;
  open: boolean;
}

export const DatabaseSettingsDeleteClusterDialog: React.FC<Props> = (props) => {
  const { databaseEngine, databaseID, databaseLabel, onClose, open } = props;
  const { enqueueSnackbar } = useSnackbar();
  const { mutateAsync: deleteDatabase } = useDeleteDatabaseMutation(
    databaseEngine,
    databaseID
  );
  const defaultError = 'There was an error deleting this Database Cluster.';
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const navigate = useNavigate();

  const onDeleteCluster = () => {
    setIsLoading(true);
    deleteDatabase()
      .then(() => {
        setIsLoading(false);
        enqueueSnackbar('Database Cluster deleted successfully.', {
          variant: 'success',
        });
        onClose();
        navigate({
          to: '/databases',
        });
      })
      .catch((e) => {
        setIsLoading(false);
        setError(getAPIErrorOrDefault(e, defaultError)[0].reason);
      });
  };

  return (
    <TypeToConfirmDialog
      entity={{
        action: 'deletion',
        name: databaseLabel,
        primaryBtnText: 'Delete Cluster',
        subType: 'Cluster',
        type: 'Database',
      }}
      expand
      label={'Cluster Name'}
      loading={isLoading}
      onClick={onDeleteCluster}
      onClose={onClose}
      open={open}
      title={`Delete Database Cluster ${databaseLabel}`}
    >
      {error ? <Notice text={error} variant="error" /> : null}
      <Notice variant="warning">
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

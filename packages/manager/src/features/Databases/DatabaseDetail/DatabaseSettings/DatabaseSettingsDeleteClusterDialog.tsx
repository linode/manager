import { NotificationBanner } from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import { useDeleteDatabaseMutation } from '@linode/queries';
import { Typography } from '@linode/ui';
import { useNavigate } from '@tanstack/react-router';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { TypeToConfirmDialog } from 'src/components/TypeToConfirmDialog/TypeToConfirmDialog';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import type { Engine } from '@linode/api-v4/lib/databases';

interface Props {
  databaseEngine: Engine;
  databaseID: number;
  databaseLabel: string;
  onClose: () => void;
  open: boolean;
}

export const DatabaseSettingsDeleteClusterDialog = (props: Props) => {
  const { databaseEngine, databaseID, databaseLabel, onClose, open } = props;
  const { enqueueSnackbar } = useSnackbar();
  const {
    mutateAsync: deleteDatabase,
    error,
    isPending,
    reset,
  } = useDeleteDatabaseMutation(databaseEngine, databaseID);
  const navigate = useNavigate();

  const _onClose = () => {
    onClose();
    reset();
  };

  const onDeleteCluster = () => {
    deleteDatabase().then(() => {
      enqueueSnackbar('Database Cluster deleted successfully.', {
        variant: 'success',
      });
      _onClose();
      reset();
      navigate({
        to: '/databases',
      });
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
      loading={isPending}
      onClick={onDeleteCluster}
      onClose={_onClose}
      open={open}
      title={`Delete Database Cluster ${databaseLabel}`}
    >
      {error ? (
        <NotificationBanner
          style={{ marginBottom: Spacing.S16 }}
          text={
            getAPIErrorOrDefault(
              error,
              'There was an error deleting this Database Cluster.'
            )[0].reason
          }
          type="error"
        />
      ) : null}
      <NotificationBanner style={{ marginBottom: Spacing.S16 }} type="warning">
        <Typography style={{ fontSize: '0.875rem' }}>
          <strong>Warning:</strong> Deleting your entire database will delete
          any backups and nodes associated with database {databaseLabel}, which
          may result in permanent data loss. This action cannot be undone.
        </Typography>
      </NotificationBanner>
    </TypeToConfirmDialog>
  );
};

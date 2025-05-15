import { useProfile } from '@linode/queries';
import { Notice, Typography } from '@linode/ui';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { TypeToConfirmDialog } from 'src/components/TypeToConfirmDialog/TypeToConfirmDialog';
import { useLegacyRestoreFromBackupMutation } from 'src/queries/databases/databases';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { formatDate } from 'src/utilities/formatDate';

import type { Database, DatabaseBackup } from '@linode/api-v4/lib/databases';
import type { DialogProps } from '@linode/ui';

interface Props extends Omit<DialogProps, 'title'> {
  backup: DatabaseBackup;
  database: Database;
  onClose: () => void;
  open: boolean;
}

export const RestoreLegacyFromBackupDialog = (props: Props) => {
  const { backup, database, onClose, open } = props;
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();
  const { data: profile } = useProfile();

  const {
    error,
    isPending,
    mutateAsync: restore,
  } = useLegacyRestoreFromBackupMutation(
    database.engine,
    database.id,
    backup?.id
  );

  const handleRestoreDatabase = () => {
    restore().then(() => {
      history.push('summary');
      enqueueSnackbar('Your database is being restored.', {
        variant: 'success',
      });
      onClose();
    });
  };

  return (
    <TypeToConfirmDialog
      entity={{
        action: 'restoration',
        name: database.label,
        primaryBtnText: 'Restore Database',
        subType: 'Cluster',
        type: 'Database',
      }}
      label={'Database Label'}
      loading={isPending}
      onClick={handleRestoreDatabase}
      onClose={onClose}
      open={open}
      title={`Restore from Backup ${formatDate(backup.created, {
        timezone: profile?.timezone,
      })}`}
    >
      {error ? (
        <Notice
          text={
            getAPIErrorOrDefault(error, 'Unable to restore this backup.')[0]
              .reason
          }
          variant="error"
        />
      ) : null}
      <Notice variant="warning">
        <Typography style={{ fontSize: '0.875rem' }}>
          <strong>Warning:</strong> Restoring from a backup will erase all
          existing data on this cluster.
        </Typography>
      </Notice>
    </TypeToConfirmDialog>
  );
};

export default RestoreLegacyFromBackupDialog;

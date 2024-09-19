import { useSnackbar } from 'notistack';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Dialog } from 'src/components/Dialog/Dialog';
import { Notice } from 'src/components/Notice/Notice';
import { Typography } from 'src/components/Typography';
import { useNewRestoreFromBackupMutation } from 'src/queries/databases/databases';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import type { Database } from '@linode/api-v4/lib/databases';
import type { DialogProps } from 'src/components/Dialog/Dialog';

interface Props extends Omit<DialogProps, 'title'> {
  database: Database;
  onClose: () => void;
  open: boolean;
  restoreTime?: string;
}

export const RestoreNewFromBackupDialog = (props: Props) => {
  const { database, onClose, open, restoreTime } = props;
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();

  const formatedDate = `${restoreTime?.split('T')[0]} ${restoreTime
    ?.split('T')[1]
    .slice(0, 5)}`;

  const { error, mutateAsync: restore } = useNewRestoreFromBackupMutation(
    database.engine,
    `${database.label}(FORK ${formatedDate})`,
    {
      restore_time: restoreTime,
      source: database.id,
    }
  );

  const handleNewRestoreDatabase = () => {
    restore().then(() => {
      history.push('summary');
      enqueueSnackbar('Your database is being restored.', {
        variant: 'success',
      });
      onClose();
    });
  };

  return (
    <Dialog
      onClose={onClose}
      open={open}
      subtitle={`From ${formatedDate} (UTC)`}
      title={`Restore ${database.label}`}
    >
      <Typography sx={(theme) => ({ marginBottom: theme.spacing(4) })}>
        Restoring a backup creates a fork from this backup. If you proceed and
        the fork is created successfully, you have 10 days to delete the
        original database cluster. Failing to do so will lead to additional
        billing caused by two running clusters instead of one.
      </Typography>
      <ActionsPanel
        primaryButtonProps={{
          'data-testid': 'submit',
          label: 'Restore',
          onClick: handleNewRestoreDatabase,
        }}
        secondaryButtonProps={{
          'data-testid': 'cancel',
          label: 'Cancel',
          onClick: onClose,
        }}
        sx={{
          display: 'flex',
          marginBottom: '0',
          paddingBottom: '0',
        }}
      />
      {error ? (
        <Notice
          text={
            getAPIErrorOrDefault(error, 'Unable to restore this backup.')[0]
              .reason
          }
          variant="error"
        />
      ) : null}
    </Dialog>
  );
};

export default RestoreNewFromBackupDialog;

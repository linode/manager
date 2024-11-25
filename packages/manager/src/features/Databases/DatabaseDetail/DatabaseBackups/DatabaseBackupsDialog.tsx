import { Notice, Typography } from '@linode/ui';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Dialog } from 'src/components/Dialog/Dialog';
import { useRestoreFromBackupMutation } from 'src/queries/databases/databases';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import { toDatabaseFork, toFormatedDate } from '../../utilities';

import type { Database } from '@linode/api-v4/lib/databases';
import type { DateTime } from 'luxon';
import type { DialogProps } from 'src/components/Dialog/Dialog';

interface Props extends Omit<DialogProps, 'title'> {
  database: Database;
  onClose: () => void;
  open: boolean;
  selectedDate?: DateTime | null;
  selectedTime?: number;
}

export const DatabaseBackupDialog = (props: Props) => {
  const { database, onClose, open, selectedDate, selectedTime } = props;
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();
  const [isRestoring, setIsRestoring] = useState(false);

  const formatedDate = toFormatedDate(selectedDate, selectedTime);

  const { error, mutateAsync: restore } = useRestoreFromBackupMutation(
    database.engine,
    toDatabaseFork(database.id, selectedDate, selectedTime)
  );

  const handleRestoreDatabase = () => {
    setIsRestoring(true);
    restore().then((database: Database) => {
      history.push(`/databases/${database.engine}/${database.id}`);
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
      subtitle={formatedDate && `From ${formatedDate} (UTC)`}
      title={`Restore ${database.label}`}
    >
      <Typography sx={(theme) => ({ marginBottom: theme.spacing(4) })}>
        Restoring a backup creates a fork from this backup. If you proceed and
        the fork is created successfully, you should remove the original
        database cluster. Failing to do so will lead to additional billing
        caused by two running clusters instead of one.
      </Typography>
      <ActionsPanel
        primaryButtonProps={{
          'data-testid': 'submit',
          label: 'Restore',
          loading: isRestoring,
          onClick: handleRestoreDatabase,
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

export default DatabaseBackupDialog;

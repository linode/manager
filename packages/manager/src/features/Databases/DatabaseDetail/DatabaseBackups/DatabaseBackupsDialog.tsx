import { useRestoreFromBackupMutation } from '@linode/queries';
import { ActionsPanel, Dialog, Notice, Typography } from '@linode/ui';
import { useNavigate } from '@tanstack/react-router';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import { toDatabaseFork, toFormattedDate } from '../../utilities';

import type { DatabaseBackupsValues } from './DatabaseBackups';
import type { Database } from '@linode/api-v4/lib/databases';
import type { DialogProps } from '@linode/ui';

interface Props extends Omit<DialogProps, 'title'> {
  database: Database;
  onClose: () => void;
  open: boolean;
}

export const DatabaseBackupsDialog = (props: Props) => {
  const { database, onClose, open } = props;
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [isRestoring, setIsRestoring] = useState(false);

  const { control } = useFormContext<DatabaseBackupsValues>();
  const [date, time, region] = useWatch({
    control,
    name: ['date', 'time', 'region'],
  });

  const formattedDate = toFormattedDate(date, time);

  const { error, mutateAsync: restore } = useRestoreFromBackupMutation(
    database.engine,
    {
      fork: toDatabaseFork(database.id, date, time),
      region,
    }
  );

  const handleRestoreDatabase = () => {
    setIsRestoring(true);
    restore().then((database: Database) => {
      navigate({
        to: `/databases/$engine/$databaseId`,
        params: {
          engine: database.engine,
          databaseId: database.id,
        },
      });
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
      subtitle={formattedDate && `From ${formattedDate} (UTC)`}
      title={`Restore ${database.label}`}
    >
      <Typography sx={(theme) => ({ marginBottom: theme.spacingFunction(32) })}>
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

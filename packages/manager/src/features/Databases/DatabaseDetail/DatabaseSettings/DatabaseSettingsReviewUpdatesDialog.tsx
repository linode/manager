import { ActionsPanel, Typography } from '@linode/ui';
import { useTheme } from '@mui/material';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { usePatchDatabaseMutation } from 'src/queries/databases/databases';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import type { Engine, PendingUpdates } from '@linode/api-v4/lib/databases';

interface Props {
  databaseEngine: Engine;
  databaseID: number;
  databasePendingUpdates?: PendingUpdates[];
  onClose: () => void;
  open: boolean;
}

export const DatabaseSettingsReviewUpdatesDialog = (props: Props) => {
  const { databaseEngine, databaseID, databasePendingUpdates, onClose, open } =
    props;
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const { mutateAsync: patchDatabase } = usePatchDatabaseMutation(
    databaseEngine,
    databaseID
  );

  const [error, setError] = React.useState('');
  const [loading, setIsLoading] = React.useState(false);

  const onStartMaintenance = () => {
    setIsLoading(true);
    patchDatabase()
      .then(() => {
        setIsLoading(false);
        enqueueSnackbar('Database maintenance started successfully.', {
          variant: 'success',
        });
        onClose();
      })
      .catch((e) => {
        setIsLoading(false);
        setError(
          getAPIErrorOrDefault(e, 'There was an error starting maintenance.')[0]
            .reason
        );
      });
  };

  const renderActions = (
    <ActionsPanel
      primaryButtonProps={{
        'data-testid': 'close',
        label: 'Close',
        onClick: onClose,
      }}
      secondaryButtonProps={{
        'data-testid': 'start',
        label: 'Start Maintenance Now',
        loading,
        onClick: onStartMaintenance,
        sx: {
          border: `1px solid ${theme.palette.primary.main}`,
          borderRadius: '1px',
        },
      }}
      sx={{ display: 'flex', flexGrow: 1, justifyContent: 'space-between' }}
    />
  );

  return (
    <ConfirmationDialog
      actions={renderActions}
      error={error}
      onClose={onClose}
      open={open}
      title="Maintenance Updates"
    >
      <Typography>
        During the maintenance there is a brief service interruption.
      </Typography>
      {databasePendingUpdates?.length && (
        <ul>
          {databasePendingUpdates.map((update) => (
            <li key={update.description}>{update.description}</li>
          ))}
        </ul>
      )}
    </ConfirmationDialog>
  );
};

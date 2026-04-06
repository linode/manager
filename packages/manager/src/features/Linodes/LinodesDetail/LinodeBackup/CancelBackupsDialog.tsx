import { useLinodeBackupsCancelMutation } from '@linode/queries';
import { ActionsPanel, Typography } from '@linode/ui';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { useEventsPollingActions } from 'src/queries/events/events';
import { sendBackupsDisabledEvent } from 'src/utilities/analytics/customEventAnalytics';

interface Props {
  isOpen: boolean;
  linodeId: number;
  onClose: () => void;
}

export const CancelBackupsDialog = (props: Props) => {
  const { isOpen, linodeId, onClose } = props;
  const { enqueueSnackbar } = useSnackbar();

  const {
    error,
    isPending,
    mutateAsync: cancelBackups,
  } = useLinodeBackupsCancelMutation(linodeId);

  const { checkForNewEvents } = useEventsPollingActions();

  const onCancelBackups = async () => {
    await cancelBackups();
    enqueueSnackbar('Backups are being canceled for this Linode', {
      variant: 'info',
    });
    onClose();
    checkForNewEvents();
    sendBackupsDisabledEvent();
  };

  return (
    <ConfirmationDialog
      actions={
        <ActionsPanel
          primaryButtonProps={{
            'data-testid': 'confirm-cancel',
            label: 'Cancel Backups',
            loading: isPending,
            onClick: onCancelBackups,
          }}
          secondaryButtonProps={{
            'data-testid': 'cancel-cancel',
            label: 'Close',
            onClick: onClose,
          }}
          style={{ padding: 0 }}
        />
      }
      error={error?.[0].reason}
      onClose={onClose}
      open={isOpen}
      title="Confirm Cancellation"
    >
      <Typography>
        Canceling backups associated with this Linode will delete all existing
        backups. Are you sure?
      </Typography>
      <Typography style={{ marginTop: 12 }}>
        <strong>Note: </strong>
        Once backups for this Linode have been canceled, you cannot re-enable
        them for 24 hours.
      </Typography>
    </ConfirmationDialog>
  );
};

import { useSnackbar } from 'notistack';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Typography } from 'src/components/Typography';
import { usePollingInterval } from 'src/queries/events';
import { useLinodeBackupsCancelMutation } from 'src/queries/linodes/backups';
import { sendBackupsDisabledEvent } from 'src/utilities/analytics';

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
    isLoading,
    mutateAsync: cancelBackups,
  } = useLinodeBackupsCancelMutation(linodeId);

  const { resetEventsPolling } = usePollingInterval();

  const onCancelBackups = async () => {
    await cancelBackups();
    enqueueSnackbar('Backups are being canceled for this Linode', {
      variant: 'info',
    });
    onClose();
    resetEventsPolling();
    sendBackupsDisabledEvent();
  };

  return (
    <ConfirmationDialog
      actions={
        <ActionsPanel
          primaryButtonProps={{
            'data-testid': 'confirm-cancel',
            label: 'Cancel Backups',
            loading: isLoading,
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

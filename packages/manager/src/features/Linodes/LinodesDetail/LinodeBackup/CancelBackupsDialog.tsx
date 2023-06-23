import * as React from 'react';
import { useSnackbar } from 'notistack';
import { resetEventsPolling } from 'src/eventsPolling';
import { useLinodeBackupsCancelMutation } from 'src/queries/linodes/backups';
import { sendBackupsDisabledEvent } from 'src/utilities/analytics';
import Typography from 'src/components/core/Typography';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import ActionsPanel from 'src/components/ActionsPanel/ActionsPanel';
import Button from 'src/components/Button/Button';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  linodeId: number;
}

export const CancelBackupsDialog = (props: Props) => {
  const { isOpen, linodeId, onClose } = props;
  const { enqueueSnackbar } = useSnackbar();

  const {
    error,
    isLoading,
    mutateAsync: cancelBackups,
  } = useLinodeBackupsCancelMutation(linodeId);

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
      open={isOpen}
      onClose={onClose}
      title="Confirm Cancellation"
      error={error?.[0].reason}
      actions={
        <ActionsPanel style={{ padding: 0 }}>
          <Button
            buttonType="secondary"
            onClick={onClose}
            data-qa-cancel-cancel
          >
            Close
          </Button>
          <Button
            buttonType="primary"
            onClick={onCancelBackups}
            loading={isLoading}
            data-qa-confirm-cancel
          >
            Cancel Backups
          </Button>
        </ActionsPanel>
      }
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

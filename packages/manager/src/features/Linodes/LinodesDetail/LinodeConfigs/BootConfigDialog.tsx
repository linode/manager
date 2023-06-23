import { Config } from '@linode/api-v4';
import { useSnackbar } from 'notistack';
import React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import Typography from 'src/components/core/Typography';
import { resetEventsPolling } from 'src/eventsPolling';
import { useRebootLinodeMutation } from 'src/queries/linodes/linodes';

interface Props {
  open: boolean;
  onClose: () => void;
  linodeId: number;
  config: Config | undefined;
}

export const BootConfigDialog = (props: Props) => {
  const { open, onClose, linodeId, config } = props;
  const { enqueueSnackbar } = useSnackbar();

  const { mutateAsync, isLoading, error } = useRebootLinodeMutation(linodeId);

  const onBoot = async () => {
    await mutateAsync({ config_id: config?.id ?? -1 });
    resetEventsPolling();
    enqueueSnackbar(`Successfully booted config ${config?.label}`, {
      variant: 'success',
    });
    onClose();
  };

  const actions = (
    <ActionsPanel style={{ padding: 0 }}>
      <Button onClick={onClose} buttonType="secondary">
        Cancel
      </Button>
      <Button buttonType="primary" loading={isLoading} onClick={onBoot}>
        Boot
      </Button>
    </ActionsPanel>
  );

  return (
    <ConfirmationDialog
      title="Confirm Boot"
      error={error?.[0].reason}
      open={open}
      onClose={onClose}
      actions={actions}
    >
      <Typography>
        Are you sure you want to boot &quot;{config?.label}&quot;?
      </Typography>
    </ConfirmationDialog>
  );
};

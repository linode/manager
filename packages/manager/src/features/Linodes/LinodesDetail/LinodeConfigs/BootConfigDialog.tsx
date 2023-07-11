import React from 'react';
import { Typography } from 'src/components/Typography';
import ActionsPanel from 'src/components/ActionsPanel/ActionsPanel';
import { Config } from '@linode/api-v4';
import { useSnackbar } from 'notistack';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { useRebootLinodeMutation } from 'src/queries/linodes/linodes';
import { resetEventsPolling } from 'src/eventsPolling';

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
    <ActionsPanel
      style={{ padding: 0 }}
      showPrimary
      primaryButtonHandler={onBoot}
      primaryButtonLoading={isLoading}
      primaryButtonText="Boot"
      showSecondary
      secondaryButtonHandler={onClose}
      secondaryButtonText="Cancel"
    />
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

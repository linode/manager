import { Config } from '@linode/api-v4';
import { useSnackbar } from 'notistack';
import React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Typography } from 'src/components/Typography';
import { usePollingInterval } from 'src/queries/events';
import { useRebootLinodeMutation } from 'src/queries/linodes/linodes';

interface Props {
  config: Config | undefined;
  linodeId: number;
  onClose: () => void;
  open: boolean;
}

export const BootConfigDialog = (props: Props) => {
  const { config, linodeId, onClose, open } = props;
  const { enqueueSnackbar } = useSnackbar();

  const { error, isLoading, mutateAsync } = useRebootLinodeMutation(linodeId);

  const { resetEventsPolling } = usePollingInterval();

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
      primaryButtonProps={{
        label: 'Boot',
        loading: isLoading,
        onClick: onBoot,
      }}
      secondaryButtonProps={{ label: 'Cancel', onClick: onClose }}
      style={{ padding: 0 }}
    />
  );

  return (
    <ConfirmationDialog
      actions={actions}
      error={error?.[0].reason}
      onClose={onClose}
      open={open}
      title="Confirm Boot"
    >
      <Typography>
        Are you sure you want to boot &quot;{config?.label}&quot;?
      </Typography>
    </ConfirmationDialog>
  );
};

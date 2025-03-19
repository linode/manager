import { useRebootLinodeMutation } from '@linode/queries';
import { ActionsPanel, Typography } from '@linode/ui';
import { useSnackbar } from 'notistack';
import React from 'react';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { useEventsPollingActions } from 'src/queries/events/events';

import type { Config } from '@linode/api-v4';

interface Props {
  config: Config | undefined;
  linodeId: number;
  onClose: () => void;
  open: boolean;
}

export const BootConfigDialog = (props: Props) => {
  const { config, linodeId, onClose, open } = props;
  const { enqueueSnackbar } = useSnackbar();

  const { error, isPending, mutateAsync } = useRebootLinodeMutation(linodeId);

  const { checkForNewEvents } = useEventsPollingActions();

  const onBoot = async () => {
    await mutateAsync({ config_id: config?.id ?? -1 });
    checkForNewEvents();
    enqueueSnackbar(`Successfully booted config ${config?.label}`, {
      variant: 'success',
    });
    onClose();
  };

  const actions = (
    <ActionsPanel
      primaryButtonProps={{
        label: 'Boot',
        loading: isPending,
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

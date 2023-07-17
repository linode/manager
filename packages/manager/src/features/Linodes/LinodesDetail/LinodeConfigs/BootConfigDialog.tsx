import { Config } from '@linode/api-v4';
import { useSnackbar } from 'notistack';
import React from 'react';

import ActionsPanel from 'src/components/ActionsPanel';
import { Button } from 'src/components/Button/Button';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Typography } from 'src/components/Typography';
import { resetEventsPolling } from 'src/eventsPolling';
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
      <Button buttonType="secondary" onClick={onClose}>
        Cancel
      </Button>
      <Button buttonType="primary" loading={isLoading} onClick={onBoot}>
        Boot
      </Button>
    </ActionsPanel>
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

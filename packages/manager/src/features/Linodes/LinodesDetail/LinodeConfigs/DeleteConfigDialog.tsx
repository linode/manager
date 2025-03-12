import { ActionsPanel, Typography } from '@linode/ui';
import { useSnackbar } from 'notistack';
import React from 'react';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { useLinodeConfigDeleteMutation } from '@linode/queries';

import type { Config } from '@linode/api-v4';

interface Props {
  config: Config | undefined;
  linodeId: number;
  onClose: () => void;
  open: boolean;
}

export const DeleteConfigDialog = (props: Props) => {
  const { config, linodeId, onClose, open } = props;
  const { enqueueSnackbar } = useSnackbar();

  const { error, isPending, mutateAsync } = useLinodeConfigDeleteMutation(
    linodeId,
    config?.id ?? -1
  );

  const onDelete = async () => {
    await mutateAsync();
    enqueueSnackbar(`Configuration ${config?.label} successfully deleted`, {
      variant: 'success',
    });
    onClose();
  };

  const actions = (
    <ActionsPanel
      primaryButtonProps={{
        label: 'Delete',
        loading: isPending,
        onClick: onDelete,
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
      title="Confirm Delete"
    >
      <Typography>
        Are you sure you want to delete &quot;{config?.label}&quot;?
      </Typography>
    </ConfirmationDialog>
  );
};

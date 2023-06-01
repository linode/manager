import React from 'react';
import Typography from 'src/components/core/Typography';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import { Config } from '@linode/api-v4';
import { useSnackbar } from 'notistack';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { useLinodeConfigDeleteMutation } from 'src/queries/linodes/configs';

interface Props {
  open: boolean;
  onClose: () => void;
  linodeId: number;
  config: Config | undefined;
}

export const DeleteConfigDialog = (props: Props) => {
  const { open, onClose, linodeId, config } = props;
  const { enqueueSnackbar } = useSnackbar();

  const { mutateAsync, isLoading, error } = useLinodeConfigDeleteMutation(
    linodeId,
    config?.id ?? -1
  );

  const onDelete = async () => {
    await mutateAsync();
    enqueueSnackbar('Successfully deleted config', { variant: 'success' });
    onClose();
  };

  const actions = (
    <ActionsPanel style={{ padding: 0 }}>
      <Button buttonType="secondary" onClick={onClose}>
        Cancel
      </Button>
      <Button buttonType="primary" onClick={onDelete} loading={isLoading}>
        Delete
      </Button>
    </ActionsPanel>
  );

  return (
    <ConfirmationDialog
      title="Confirm Delete"
      error={error?.[0].reason}
      open={open}
      onClose={onClose}
      actions={actions}
    >
      <Typography>
        Are you sure you want to delete &quot;
        {config?.label}?&quot;
      </Typography>
    </ConfirmationDialog>
  );
};

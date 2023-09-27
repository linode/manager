import { Config } from '@linode/api-v4';
import React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Typography } from 'src/components/Typography';
import { useLinodeConfigDeleteMutation } from 'src/queries/linodes/configs';

interface Props {
  config: Config | undefined;
  linodeId: number;
  onClose: () => void;
  open: boolean;
}

export const DeleteConfigDialog = (props: Props) => {
  const { config, linodeId, onClose, open } = props;

  const { error, isLoading, mutateAsync } = useLinodeConfigDeleteMutation(
    linodeId,
    config?.id ?? -1
  );

  const onDelete = async () => {
    await mutateAsync();
    onClose();
  };

  const actions = (
    <ActionsPanel
      primaryButtonProps={{
        label: 'Delete',
        loading: isLoading,
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

import { useDeleteStreamMutation } from '@linode/queries';
import { ActionsPanel } from '@linode/ui';
import { enqueueSnackbar } from 'notistack';
import * as React from 'react';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';

import type { Stream } from '@linode/api-v4';

interface Props {
  onClose: () => void;
  open: boolean;
  stream: Stream | undefined;
}

export const DeleteStreamDialog = React.memo((props: Props) => {
  const { onClose, open, stream } = props;
  const {
    mutateAsync: deleteStream,
    isPending,
    error,
  } = useDeleteStreamMutation();

  const handleDelete = () => {
    const { id, label } = stream as Stream;
    deleteStream({
      id,
    }).then(() => {
      onClose();
      return enqueueSnackbar(`Stream ${label} deleted successfully`, {
        variant: 'success',
      });
    });
  };

  const actions = (
    <ActionsPanel
      primaryButtonProps={{
        label: 'Delete',
        loading: isPending,
        disabled: false,
        onClick: handleDelete,
      }}
      secondaryButtonProps={{ label: 'Cancel', onClick: onClose }}
      style={{ padding: 0 }}
    />
  );

  return (
    <ConfirmationDialog
      actions={actions}
      error={error}
      onClose={onClose}
      open={open}
      title="Delete Stream"
    >
      Are you sure you want to delete &#34;{stream?.label}&#34; stream?
    </ConfirmationDialog>
  );
});

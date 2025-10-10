import { useDeleteDestinationMutation } from '@linode/queries';
import { ActionsPanel } from '@linode/ui';
import { enqueueSnackbar } from 'notistack';
import * as React from 'react';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';

import type { Destination } from '@linode/api-v4';

interface Props {
  destination: Destination | undefined;
  onClose: () => void;
  open: boolean;
}

export const DeleteDestinationDialog = React.memo((props: Props) => {
  const { onClose, open, destination } = props;
  const {
    mutateAsync: deleteDestination,
    isPending,
    error,
  } = useDeleteDestinationMutation();

  const handleDelete = () => {
    const { id, label } = destination as Destination;
    deleteDestination({
      id,
    }).then(() => {
      onClose();
      return enqueueSnackbar(`Destination ${label} deleted successfully`, {
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
      title="Delete Destination"
    >
      Are you sure you want to delete &#34;{destination?.label}&#34;
      destination?
    </ConfirmationDialog>
  );
});

import { useDeleteDestinationMutation } from '@linode/queries';
import { ActionsPanel } from '@linode/ui';
import { enqueueSnackbar } from 'notistack';
import * as React from 'react';
import { useEffect } from 'react';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import type { Destination } from '@linode/api-v4';

interface Props {
  destination: Destination | undefined;
  onClose: () => void;
  open: boolean;
}

export const DeleteDestinationDialog = React.memo((props: Props) => {
  const { onClose, open, destination } = props;
  const { mutateAsync: deleteDestination, isPending } =
    useDeleteDestinationMutation();
  const [deleteError, setDeleteError] = React.useState<string | undefined>();

  const handleDelete = () => {
    const { id, label } = destination as Destination;
    deleteDestination({
      id,
    })
      .then(() => {
        onClose();
        return enqueueSnackbar(`Destination ${label} deleted successfully`, {
          variant: 'success',
        });
      })
      .catch((error) => {
        setDeleteError(
          getAPIErrorOrDefault(
            error,
            'There was an issue deleting your destination'
          )[0].reason
        );
      });
  };

  useEffect(() => {
    if (open) {
      setDeleteError(undefined);
    }
  }, [open]);

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
      error={deleteError}
      onClose={onClose}
      open={open}
      title="Delete Destination"
    >
      Are you sure you want to delete &#34;{destination?.label}&#34;
      destination?
    </ConfirmationDialog>
  );
});

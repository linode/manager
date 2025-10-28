import { useDeleteStreamMutation } from '@linode/queries';
import { ActionsPanel } from '@linode/ui';
import { enqueueSnackbar } from 'notistack';
import * as React from 'react';
import { useEffect } from 'react';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import type { Stream } from '@linode/api-v4';

interface Props {
  onClose: () => void;
  open: boolean;
  stream: Stream | undefined;
}

export const DeleteStreamDialog = React.memo((props: Props) => {
  const { onClose, open, stream } = props;
  const { mutateAsync: deleteStream, isPending } = useDeleteStreamMutation();
  const [deleteError, setDeleteError] = React.useState<string | undefined>();

  const handleDelete = () => {
    const { id, label } = stream as Stream;
    deleteStream({
      id,
    })
      .then(() => {
        onClose();
        return enqueueSnackbar(`Stream ${label} deleted successfully`, {
          variant: 'success',
        });
      })
      .catch((error) => {
        setDeleteError(
          getAPIErrorOrDefault(
            error,
            'There was an issue deleting your stream'
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
      title="Delete Stream"
    >
      Are you sure you want to delete &#34;{stream?.label}&#34; stream?
    </ConfirmationDialog>
  );
});

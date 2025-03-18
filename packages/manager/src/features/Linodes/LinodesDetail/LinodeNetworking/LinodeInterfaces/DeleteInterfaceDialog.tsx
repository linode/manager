import {
  useDeleteLinodeInterfaceMutation,
  useLinodeInterfaceQuery,
} from '@linode/queries';
import { ActionsPanel } from '@linode/ui';
import { useSnackbar } from 'notistack';
import React from 'react';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';

import { getLinodeInterfaceType } from './utilities';

interface Props {
  interfaceId: number | undefined;
  linodeId: number;
  onClose: () => void;
  open: boolean;
}

export const DeleteInterfaceDialog = (props: Props) => {
  const { interfaceId, linodeId, onClose, open } = props;

  const { enqueueSnackbar } = useSnackbar();

  const {
    data: linodeInterface,
    error: interfaceError,
    isLoading,
  } = useLinodeInterfaceQuery(
    linodeId,
    interfaceId ?? -1,
    open && Boolean(interfaceId)
  );

  const { error, isPending, mutate } = useDeleteLinodeInterfaceMutation(
    linodeId,
    {
      onSuccess() {
        enqueueSnackbar('Successfully deleted interface.', {
          variant: 'success',
        });
        onClose();
      },
    }
  );

  const type = linodeInterface
    ? getLinodeInterfaceType(linodeInterface)
    : 'Unknown;';

  return (
    <ConfirmationDialog
      actions={
        <ActionsPanel
          primaryButtonProps={{
            label: 'Delete',
            loading: isPending,
            onClick: () => mutate(interfaceId ?? -1),
          }}
          secondaryButtonProps={{
            label: 'Cancel',
            onClick: onClose,
          }}
        />
      }
      error={interfaceError?.[0].reason ?? error?.[0].reason}
      isFetching={isLoading}
      onClose={onClose}
      open={open}
      title={`Delete ${type} Interface ID #${interfaceId}?`}
    >
      Are you sure you want to delete this {type} interface?
    </ConfirmationDialog>
  );
};

import { ActionsPanel, Typography } from '@linode/ui';
import React from 'react';

import { Code } from 'src/components/Code/Code';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';

import { useRemoveIPv4 } from './utilities';

interface Props {
  address: string | undefined;
  interfaceId: number;
  linodeId: number;
  onClose: () => void;
  open: boolean;
}

export const DeleteIPv4Dialog = (props: Props) => {
  const { address, interfaceId, linodeId, onClose, open } = props;

  const { error, isPending, onRemove, reset } = useRemoveIPv4({
    interfaceId,
    linodeId,
    onSuccess() {
      onClose();
    },
  });

  const handleClose = () => {
    onClose();
    reset();
  };

  return (
    <ConfirmationDialog
      actions={
        <ActionsPanel
          primaryButtonProps={{
            label: 'Delete',
            loading: isPending,
            onClick: () => onRemove(address ?? ''),
          }}
          secondaryButtonProps={{
            label: 'Cancel',
            onClick: handleClose,
          }}
        />
      }
      error={error?.[0].reason}
      onClose={handleClose}
      open={open}
      title="Delete IPv4 Address?"
    >
      <Typography>
        Are you sure you want to delete <Code>{address ?? ''}</Code> from this
        interface?
      </Typography>
    </ConfirmationDialog>
  );
};

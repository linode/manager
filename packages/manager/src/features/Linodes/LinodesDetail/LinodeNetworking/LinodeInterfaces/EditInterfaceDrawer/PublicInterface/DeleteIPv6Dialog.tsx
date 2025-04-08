import { ActionsPanel, Typography } from '@linode/ui';
import React from 'react';

import { Code } from 'src/components/Code/Code';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';

import { useRemoveIPv6 } from './utilities';

interface Props {
  interfaceId: number;
  linodeId: number;
  onClose: () => void;
  open: boolean;
  range: string | undefined;
}

export const DeleteIPv6Dialog = (props: Props) => {
  const { interfaceId, linodeId, onClose, open, range } = props;

  const { error, isPending, onRemove, reset } = useRemoveIPv6({
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
            onClick: () => onRemove(range ?? ''),
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
      title="Delete IPv6 Range?"
    >
      <Typography>
        Are you sure you want to delete <Code>{range ?? ''}</Code> from this
        interface?
      </Typography>
    </ConfirmationDialog>
  );
};

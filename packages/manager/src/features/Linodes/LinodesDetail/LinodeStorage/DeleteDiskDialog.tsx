import React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { useLinodeDeleteDiskMutation } from 'src/queries/linodes/disks';

import type { Disk } from '@linode/api-v4';

interface Props {
  disk: Disk | undefined;
  linodeId: number;
  onClose: () => void;
  open: boolean;
}

export const DeleteDiskDialog = (props: Props) => {
  const { disk, linodeId, onClose, open } = props;

  const {
    error,
    isPending,
    mutateAsync: deleteDisk,
    reset,
  } = useLinodeDeleteDiskMutation(linodeId, disk?.id ?? -1);

  React.useEffect(() => {
    if (open) {
      reset();
    }
  }, [open]);

  const onDelete = async () => {
    await deleteDisk();
    onClose();
  };

  return (
    <ConfirmationDialog
      actions={
        <ActionsPanel
          primaryButtonProps={{
            'data-testid': 'confirm-delete',
            label: 'Delete',
            loading: isPending,
            onClick: onDelete,
          }}
          secondaryButtonProps={{
            'data-testid': 'cancel-delete',
            label: 'Cancel',
            onClick: onClose,
          }}
          style={{ padding: 0 }}
        />
      }
      error={error?.[0].reason}
      onClose={onClose}
      open={open}
      title="Confirm Delete"
    >
      Are you sure you want to delete {disk?.label}?
    </ConfirmationDialog>
  );
};

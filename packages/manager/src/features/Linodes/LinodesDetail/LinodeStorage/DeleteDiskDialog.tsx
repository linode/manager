import React from 'react';

import ActionsPanel from 'src/components/ActionsPanel';
import { Button } from 'src/components/Button/Button';
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
    isLoading,
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
        <ActionsPanel style={{ padding: 0 }}>
          <Button
            buttonType="secondary"
            data-qa-cancel-delete
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            buttonType="primary"
            data-qa-confirm-delete
            loading={isLoading}
            onClick={onDelete}
          >
            Delete
          </Button>
        </ActionsPanel>
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

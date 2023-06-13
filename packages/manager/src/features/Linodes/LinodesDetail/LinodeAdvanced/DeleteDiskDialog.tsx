import React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button/Button';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { useLinodeDeleteDiskMutation } from 'src/queries/linodes/disks';
import type { Disk } from '@linode/api-v4';

interface Props {
  open: boolean;
  onClose: () => void;
  disk: Disk | undefined;
  linodeId: number;
}

export const DeleteDiskDialog = (props: Props) => {
  const { onClose, open, disk, linodeId } = props;

  const {
    mutateAsync: deleteDisk,
    isLoading,
    error,
  } = useLinodeDeleteDiskMutation(linodeId, disk?.id ?? -1);

  const onDelete = async () => {
    await deleteDisk();
    onClose();
  };

  return (
    <ConfirmationDialog
      title="Confirm Delete"
      open={open}
      onClose={onClose}
      error={error?.[0].reason}
      actions={
        <ActionsPanel style={{ padding: 0 }}>
          <Button
            buttonType="secondary"
            onClick={onClose}
            data-qa-cancel-delete
          >
            Cancel
          </Button>
          <Button
            buttonType="primary"
            onClick={onDelete}
            loading={isLoading}
            data-qa-confirm-delete
          >
            Delete
          </Button>
        </ActionsPanel>
      }
    >
      Are you sure you want to delete {disk?.label}?
    </ConfirmationDialog>
  );
};

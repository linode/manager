import React from 'react';
import ActionsPanel from 'src/components/ActionsPanel/ActionsPanel';
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
      title="Confirm Delete"
      open={open}
      onClose={onClose}
      error={error?.[0].reason}
      actions={
        <ActionsPanel
          style={{ padding: 0 }}
          primary
          primaryButtonDataTestId="confirm-delete"
          primaryButtonHandler={onDelete}
          primaryButtonLoading={isLoading}
          primaryButtonText="Delete"
          secondary
          secondaryButtonDataTestId="cancel-delete"
          secondaryButtonHandler={onClose}
          secondaryButtonText="Cancel"
        />
      }
    >
      Are you sure you want to delete {disk?.label}?
    </ConfirmationDialog>
  );
};

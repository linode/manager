import { Typography } from '@linode/ui';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { useDeleteSSHKeyMutation } from 'src/queries/profile/profile';

interface Props {
  id: number;
  label?: string;
  onClose: () => void;
  open: boolean;
}

const DeleteSSHKeyDialog = ({ id, label, onClose, open }: Props) => {
  const { error, isPending, mutateAsync } = useDeleteSSHKeyMutation(id);

  const onDelete = async () => {
    await mutateAsync();
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
        />
      }
      error={error?.[0].reason}
      onClose={onClose}
      open={open}
      title="Delete SSH Key"
    >
      <Typography>Are you sure you want to delete SSH key {label}?</Typography>
    </ConfirmationDialog>
  );
};

export default React.memo(DeleteSSHKeyDialog);

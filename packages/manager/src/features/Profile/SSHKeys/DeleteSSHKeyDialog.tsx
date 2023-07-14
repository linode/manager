import * as React from 'react';

import ActionsPanel from 'src/components/ActionsPanel';
import { Button } from 'src/components/Button/Button';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Typography } from 'src/components/Typography';
import { useDeleteSSHKeyMutation } from 'src/queries/profile';

interface Props {
  id: number;
  label?: string;
  onClose: () => void;
  open: boolean;
}

const DeleteSSHKeyDialog = ({ id, label, onClose, open }: Props) => {
  const { error, isLoading, mutateAsync } = useDeleteSSHKeyMutation(id);

  const onDelete = async () => {
    await mutateAsync();
    onClose();
  };

  return (
    <ConfirmationDialog
      actions={
        <ActionsPanel>
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
      title="Delete SSH Key"
    >
      <Typography>Are you sure you want to delete SSH key {label}?</Typography>
    </ConfirmationDialog>
  );
};

export default React.memo(DeleteSSHKeyDialog);

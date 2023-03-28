import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Typography from 'src/components/core/Typography';
import { useDeleteSSHKeyMutation } from 'src/queries/profile';

interface Props {
  open: boolean;
  onClose: () => void;
  id: number;
  label?: string;
}

const DeleteSSHKeyDialog = ({ id, open, onClose, label }: Props) => {
  const { mutateAsync, isLoading, error } = useDeleteSSHKeyMutation(id);

  const onDelete = async () => {
    await mutateAsync();
    onClose();
  };

  return (
    <ConfirmationDialog
      open={open}
      onClose={onClose}
      title="Delete SSH Key"
      error={error?.[0].reason}
      actions={
        <ActionsPanel>
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
      <Typography>Are you sure you want to delete SSH key {label}?</Typography>
    </ConfirmationDialog>
  );
};

export default React.memo(DeleteSSHKeyDialog);

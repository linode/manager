import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Typography } from 'src/components/Typography';
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
        <ActionsPanel
          primary
          primaryButtonDataTestId="confirm-delete"
          primaryButtonHandler={onDelete}
          primaryButtonLoading={isLoading}
          secondary
          secondaryButtonDataTestId="cancel-delete"
          secondaryButtonHandler={onClose}
          secondaryButtonText="Cancel"
        />
      }
    >
      <Typography>Are you sure you want to delete SSH key {label}?</Typography>
    </ConfirmationDialog>
  );
};

export default React.memo(DeleteSSHKeyDialog);

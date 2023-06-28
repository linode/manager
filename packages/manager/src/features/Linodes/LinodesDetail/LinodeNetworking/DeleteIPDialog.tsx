import * as React from 'react';
import { useSnackbar } from 'notistack';
import ActionsPanel from 'src/components/ActionsPanel';
import { Button } from 'src/components/Button/Button';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import Typography from 'src/components/core/Typography';
import { useLinodeIPDeleteMutation } from 'src/queries/linodes/networking';

interface Props {
  onClose: () => void;
  open: boolean;
  address: string;
  linodeId: number;
}

export const DeleteIPDialog = (props: Props) => {
  const { open, onClose, linodeId, address } = props;
  const { enqueueSnackbar } = useSnackbar();

  const { mutateAsync: removeIP, isLoading, error } = useLinodeIPDeleteMutation(
    linodeId,
    address
  );

  const handleDeleteIP = async () => {
    await removeIP();
    enqueueSnackbar(`Successfully removed ${address}`, { variant: 'success' });
    onClose();
  };

  return (
    <ConfirmationDialog
      open={open}
      onClose={onClose}
      error={error?.[0].reason}
      title={`Delete ${address}?`}
      actions={
        <ActionsPanel>
          <Button buttonType="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            buttonType="primary"
            onClick={handleDeleteIP}
            loading={isLoading}
          >
            Delete IP
          </Button>
        </ActionsPanel>
      }
    >
      <Typography>
        Are you sure you want to delete this IP Address? This action cannot be
        undone.
      </Typography>
    </ConfirmationDialog>
  );
};

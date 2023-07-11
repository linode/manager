import * as React from 'react';
import { useSnackbar } from 'notistack';
import ActionsPanel from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Typography } from 'src/components/Typography';
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
        <ActionsPanel
          showPrimary
          primaryButtonHandler={handleDeleteIP}
          primaryButtonLoading={isLoading}
          primaryButtonText="Delete IP"
          showSecondary
          secondaryButtonHandler={onClose}
          secondaryButtonText="Cancel"
        />
      }
    >
      <Typography>
        Are you sure you want to delete this IP Address? This action cannot be
        undone.
      </Typography>
    </ConfirmationDialog>
  );
};

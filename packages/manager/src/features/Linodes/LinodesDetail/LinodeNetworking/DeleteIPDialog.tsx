import { useSnackbar } from 'notistack';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Typography } from 'src/components/Typography';
import { useLinodeIPDeleteMutation } from 'src/queries/linodes/networking';

interface Props {
  address: string;
  linodeId: number;
  onClose: () => void;
  open: boolean;
}

export const DeleteIPDialog = (props: Props) => {
  const { address, linodeId, onClose, open } = props;
  const { enqueueSnackbar } = useSnackbar();

  const { error, isLoading, mutateAsync: removeIP } = useLinodeIPDeleteMutation(
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
      actions={
        <ActionsPanel
          primaryButtonProps={{
            label: 'Delete IP',
            loading: isLoading,
            onClick: handleDeleteIP,
          }}
          secondaryButtonProps={{ label: 'Cancel', onClick: onClose }}
        />
      }
      error={error?.[0].reason}
      onClose={onClose}
      open={open}
      title={`Delete ${address}?`}
    >
      <Typography>
        Are you sure you want to delete this IP Address? This action cannot be
        undone.
      </Typography>
    </ConfirmationDialog>
  );
};

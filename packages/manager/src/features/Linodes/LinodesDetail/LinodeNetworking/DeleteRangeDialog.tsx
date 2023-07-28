import { IPRange } from '@linode/api-v4';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Typography } from 'src/components/Typography';
import { useLinodeRemoveRangeMutation } from 'src/queries/linodes/networking';

interface Props {
  onClose: () => void;
  open: boolean;
  range: IPRange;
}

export const DeleteRangeDialog = (props: Props) => {
  const { onClose, open, range } = props;
  const { enqueueSnackbar } = useSnackbar();

  const {
    error,
    isLoading,
    mutateAsync: removeRange,
  } = useLinodeRemoveRangeMutation(range.range);

  const handleDeleteIP = async () => {
    await removeRange();
    enqueueSnackbar(`Successfully removed ${range.range}/${range.prefix}`, {
      variant: 'success',
    });
    onClose();
  };

  return (
    <ConfirmationDialog
      actions={
        <ActionsPanel
          primaryButtonProps={{
            label: 'Delete Range',
            loading: isLoading,
            onClick: handleDeleteIP,
          }}
          secondaryButtonProps={{ label: 'Cancel', onClick: onClose }}
        />
      }
      error={error?.[0].reason}
      onClose={onClose}
      open={open}
      title={`Delete ${range.range}/${range.prefix}?`}
    >
      <Typography>
        Are you sure you want to delete this IP Range? This action cannot be
        undone.
      </Typography>
    </ConfirmationDialog>
  );
};

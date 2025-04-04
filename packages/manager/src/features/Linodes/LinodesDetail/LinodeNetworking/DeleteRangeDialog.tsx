import { useLinodeRemoveRangeMutation } from '@linode/queries';
import { ActionsPanel, Typography } from '@linode/ui';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';

import type { IPRange } from '@linode/api-v4';

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
    isPending,
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
            loading: isPending,
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

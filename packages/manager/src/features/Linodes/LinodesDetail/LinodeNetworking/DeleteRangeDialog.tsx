import * as React from 'react';
import { useSnackbar } from 'notistack';
import ActionsPanel from 'src/components/ActionsPanel/ActionsPanel';
import { Button } from 'src/components/Button/Button';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Typography } from 'src/components/Typography';
import { useLinodeRemoveRangeMutation } from 'src/queries/linodes/networking';
import { IPRange } from '@linode/api-v4';

interface Props {
  onClose: () => void;
  open: boolean;
  range: IPRange;
}

export const DeleteRangeDialog = (props: Props) => {
  const { open, onClose, range } = props;
  const { enqueueSnackbar } = useSnackbar();

  const {
    mutateAsync: removeRange,
    isLoading,
    error,
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
      open={open}
      onClose={onClose}
      error={error?.[0].reason}
      title={`Delete ${range.range}/${range.prefix}?`}
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
            Delete Range
          </Button>
        </ActionsPanel>
      }
    >
      <Typography>
        Are you sure you want to delete this IP Range? This action cannot be
        undone.
      </Typography>
    </ConfirmationDialog>
  );
};

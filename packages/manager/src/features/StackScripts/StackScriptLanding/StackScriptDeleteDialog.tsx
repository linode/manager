import { useDeleteStackScriptMutation } from '@linode/queries';
import { Button, Stack, Typography } from '@linode/ui';
import { useSnackbar } from 'notistack';
import React from 'react';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';

import type { StackScript } from '@linode/api-v4';

interface Props {
  isFetching: boolean;
  onClose: () => void;
  open: boolean;
  stackscript: StackScript | undefined;
}

export const StackScriptDeleteDialog = (props: Props) => {
  const { isFetching, onClose, open, stackscript } = props;
  const { enqueueSnackbar } = useSnackbar();

  const { error, isPending, mutate } = useDeleteStackScriptMutation(
    stackscript?.id ?? -1,
    {
      onSuccess() {
        enqueueSnackbar({
          message: `Successfully deleted StackScript.`,
          variant: 'success',
        });
        onClose();
      },
    }
  );

  return (
    <ConfirmationDialog
      actions={
        <Stack direction="row" spacing={1}>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            buttonType="primary"
            loading={isPending}
            onClick={() => mutate()}
          >
            Delete StackScript
          </Button>
        </Stack>
      }
      error={error?.[0].reason}
      isFetching={isFetching}
      onClose={onClose}
      open={open}
      title={`Delete StackScript ${stackscript?.label}?`}
    >
      <Typography>Are you sure you want to delete this StackScript?</Typography>
    </ConfirmationDialog>
  );
};

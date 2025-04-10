import { useUpdateStackScriptMutation } from '@linode/queries';
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

export const StackScriptMakePublicDialog = (props: Props) => {
  const { isFetching, onClose, open, stackscript } = props;
  const { enqueueSnackbar } = useSnackbar();

  const { error, isPending, mutate } = useUpdateStackScriptMutation(
    stackscript?.id ?? -1,
    {
      onSuccess(stackscript) {
        enqueueSnackbar({
          message: `${stackscript.label} successfully published to the public library.`,
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
            onClick={() => mutate({ is_public: true })}
          >
            Confirm
          </Button>
        </Stack>
      }
      error={error?.[0].reason}
      isFetching={isFetching}
      onClose={onClose}
      open={open}
      title={`Make StackScript ${stackscript?.label ?? ''} Public?`}
    >
      <Typography>
        Are you sure you want to make {stackscript?.label} public? This action
        cannot be undone, nor will you be able to delete the StackScript once
        made available to the public.
      </Typography>
    </ConfirmationDialog>
  );
};

import { useSnackbar } from 'notistack';
import React from 'react';

import { Button } from 'src/components/Button/Button';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Stack } from 'src/components/Stack';
import { Typography } from 'src/components/Typography';
import { useUpdateStackScriptMutation } from 'src/queries/stackscripts';

import type { StackScript } from '@linode/api-v4';

interface Props {
  onClose: () => void;
  open: boolean;
  stackscript: StackScript | undefined;
}

export const StackScriptMakePublicDialog = (props: Props) => {
  const { onClose, open, stackscript } = props;
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
            Yes, make me a star!
          </Button>
        </Stack>
      }
      error={error?.[0].reason}
      onClose={onClose}
      open={open}
      title={`Woah, just a word of caution...`}
    >
      <Typography>
        Are you sure you want to make {stackscript?.label} public? This action
        cannot be undone, nor will you be able to delete the StackScript once
        made available to the public.
      </Typography>
    </ConfirmationDialog>
  );
};

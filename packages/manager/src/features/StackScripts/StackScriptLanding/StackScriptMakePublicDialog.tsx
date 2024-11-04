import React from 'react';

import { Button } from 'src/components/Button/Button';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Stack } from 'src/components/Stack';
import { Typography } from 'src/components/Typography';

import type { StackScript } from '@linode/api-v4';

interface Props {
  onClose: () => void;
  open: boolean;
  stackscript: StackScript | undefined;
}

export const StackScriptMakePublicDialog = (props: Props) => {
  const { onClose, open, stackscript } = props;

  const makePublic = () => {};

  return (
    <ConfirmationDialog
      actions={
        <Stack direction="row">
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={makePublic}>Yes, make me a star!</Button>
        </Stack>
      }
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

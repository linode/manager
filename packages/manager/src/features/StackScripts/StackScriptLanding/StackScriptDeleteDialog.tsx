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

export const StackScriptDeleteDialog = (props: Props) => {
  const { onClose, open, stackscript } = props;

  const handleDelete = () => {};

  return (
    <ConfirmationDialog
      actions={
        <Stack direction="row">
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleDelete}>Delete StackScript</Button>
        </Stack>
      }
      onClose={onClose}
      open={open}
      title={`Delete StackScript ${stackscript?.label}?`}
    >
      <Typography>Are you sure you want to delete this StackScript?</Typography>
    </ConfirmationDialog>
  );
};

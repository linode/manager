import * as React from 'react';

import ActionsPanel from 'src/components/ActionsPanel';
import { Button } from 'src/components/Button/Button';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Typography } from 'src/components/Typography';

interface Props {
  onClose: () => void;
  open: boolean;
  scratchCode: string;
}

export const ScratchCodeDialog = (props: Props) => {
  const { onClose, open, scratchCode } = props;

  return (
    <ConfirmationDialog
      actions={
        <ActionsPanel>
          <Button buttonType="secondary" data-qa-submit onClick={onClose}>
            Got it
          </Button>
        </ActionsPanel>
      }
      onClose={onClose}
      open={open}
      title="Scratch Code"
    >
      <Typography>
        {`This scratch code can be used in place of two-factor authentication in the event
          you cannot access your two-factor authentication device. It is limited to a one-time
          use. Be sure to make a note of it and keep it secure, as this is the only time it
          will appear:`}
      </Typography>
      <Typography
        style={{
          marginTop: '16px',
        }}
        variant="h5"
      >
        {scratchCode}
      </Typography>
    </ConfirmationDialog>
  );
};

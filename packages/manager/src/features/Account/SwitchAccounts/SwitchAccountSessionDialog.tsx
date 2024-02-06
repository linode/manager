import React from 'react';
import { useHistory } from 'react-router-dom';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Typography } from 'src/components/Typography';

export const SwitchAccountDialog = React.memo(
  ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const history = useHistory();

    const actions = (
      <ActionsPanel
        primaryButtonProps={{
          label: 'Log in',
          onClick: () => history.push('/logout'),
        }}
        secondaryButtonProps={{ label: 'Close', onClick: onClose }}
      />
    );

    return (
      <ConfirmationDialog
        actions={actions}
        maxWidth="xs"
        onClose={onClose}
        open={isOpen}
        title="Session expired"
      >
        <Typography>
          Log in again to switch accounts or close this window to continue
          working on the current account.
        </Typography>
      </ConfirmationDialog>
    );
  }
);

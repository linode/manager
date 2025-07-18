import { ActionsPanel, Typography } from '@linode/ui';
import React from 'react';
// eslint-disable-next-line no-restricted-imports
import { useHistory } from 'react-router-dom';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { sendSwitchAccountSessionExpiryEvent } from 'src/utilities/analytics/customEventAnalytics';

export const SwitchAccountSessionDialog = React.memo(
  ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const history = useHistory();

    const actions = (
      <ActionsPanel
        primaryButtonProps={{
          label: 'Log in',
          onClick: () => {
            sendSwitchAccountSessionExpiryEvent('Log In');
            history.push('/logout');
          },
        }}
        secondaryButtonProps={{
          label: 'Close',
          onClick: () => {
            sendSwitchAccountSessionExpiryEvent('Close');
            onClose();
          },
        }}
      />
    );

    return (
      <ConfirmationDialog
        actions={actions}
        data-testid="switch-account-session-dialog"
        maxWidth="xs"
        onClose={() => {
          sendSwitchAccountSessionExpiryEvent('Close');
          onClose();
        }}
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

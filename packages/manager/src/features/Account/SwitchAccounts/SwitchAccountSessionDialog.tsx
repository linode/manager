import { ActionsPanel, Typography } from '@linode/ui';
import { useNavigate } from '@tanstack/react-router';
import React from 'react';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { sendSwitchAccountSessionExpiryEvent } from 'src/utilities/analytics/customEventAnalytics';

export const SwitchAccountSessionDialog = React.memo(
  ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const navigate = useNavigate();

    const actions = (
      <ActionsPanel
        primaryButtonProps={{
          label: 'Log in',
          onClick: () => {
            sendSwitchAccountSessionExpiryEvent('Log In');
            navigate({ to: '/logout' });
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

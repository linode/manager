import { Typography } from '@linode/ui';
import React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';

import type { ActionPanelProps } from 'src/components/ActionsPanel/ActionsPanel';

interface AlertResourcesConfirmDialogProps {
  /**
   * Callback function to handle closing the confirmation dialog.
   */
  onClose: () => void;

  /**
   * Callback function to handle confirmation action (e.g., saving resources).
   */
  onConfirm: () => void;

  /**
   * Boolean flag to control whether the confirmation dialog is open.
   */
  openConfirmationDialog: boolean;
}

export const EditAlertResourcesConfirmDialog = React.memo(
  (props: AlertResourcesConfirmDialogProps) => {
    const { onClose, onConfirm, openConfirmationDialog } = props;

    const actionProps: ActionPanelProps = {
      primaryButtonProps: {
        'data-testid': 'editconfirmation',
        label: 'Confirm',
        onClick: onConfirm,
      },
      secondaryButtonProps: {
        label: 'Cancel',
        onClick: onClose,
      },
    };

    return (
      <ConfirmationDialog
        actions={<ActionsPanel {...actionProps} />}
        aria-live="assertive"
        onClose={onClose}
        open={openConfirmationDialog}
        sx={{ fontSize: '16px' }}
        title="Confirm alert updates"
      >
        <Typography fontSize="16px" variant="body1">
          You have changed the resource settings for your alert.
          <br />
          This also updates your alert definition.
        </Typography>
      </ConfirmationDialog>
    );
  }
);

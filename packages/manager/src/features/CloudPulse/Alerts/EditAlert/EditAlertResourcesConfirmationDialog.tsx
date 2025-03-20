import { ActionsPanel, Typography } from '@linode/ui';
import React from 'react';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';

import type { ActionPanelProps } from '@linode/ui';

interface AlertResourcesConfirmDialogProps {
  /**
   * Boolean flag to control the loading state of the confirm button based on api call pending for result state
   */
  isApiResponsePending: boolean;

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
    const {
      isApiResponsePending,
      onClose,
      onConfirm,
      openConfirmationDialog,
    } = props;

    const actionProps: ActionPanelProps = {
      primaryButtonProps: {
        'data-testid': 'edit-confirmation',
        label: 'Confirm',
        loading: isApiResponsePending,
        onClick: onConfirm,
      },
      secondaryButtonProps: {
        disabled: isApiResponsePending,
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
        title="Confirm alert updates"
      >
        <Typography
          sx={(theme) => ({
            font: theme.tokens.alias.Typography.Body,
          })}
          variant="body1"
        >
          You have changed the resource settings for your alert.
          <br />
          This also updates your alert definition.
        </Typography>
      </ConfirmationDialog>
    );
  }
);

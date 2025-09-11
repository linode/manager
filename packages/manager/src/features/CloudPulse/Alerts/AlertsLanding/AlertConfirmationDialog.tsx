import { ActionsPanel, Typography } from '@linode/ui';
import React from 'react';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';

interface AlertConfirmationDialogProps {
  /**
   * Handler function for cancel button
   */
  handleCancel: () => void;

  /**
   * Handler function for enable/disable button
   */
  handleConfirm: () => void;

  /**
   * Loading state of the confirmation dialog
   */
  isLoading?: boolean;

  /**
   * Current state of the confirmation dialoge whether open or not
   */
  isOpen: boolean;

  /**
   * Message to be displayed in the confirmation dialog
   */
  message: React.ReactNode;

  /**
   * Label of the primary button
   */
  primaryButtonLabel: string;

  /**
   * Title of the confirmation dialog
   */
  title: string;
}

export const AlertConfirmationDialog = React.memo(
  (props: AlertConfirmationDialogProps) => {
    const {
      handleCancel,
      handleConfirm,
      isLoading = false,
      isOpen,
      message,
      title,
      primaryButtonLabel,
    } = props;

    const actionsPanel = (
      <ActionsPanel
        primaryButtonProps={{
          label: primaryButtonLabel,
          loading: isLoading,
          onClick: handleConfirm,
        }}
        secondaryButtonProps={{
          disabled: isLoading,
          label: 'Cancel',
          onClick: handleCancel,
        }}
      />
    );

    return (
      <ConfirmationDialog
        actions={actionsPanel}
        data-testid="confirmation-dialog"
        onClose={handleCancel}
        open={isOpen}
        title={title}
      >
        <Typography variant="subtitle2">{message}</Typography>
      </ConfirmationDialog>
    );
  }
);

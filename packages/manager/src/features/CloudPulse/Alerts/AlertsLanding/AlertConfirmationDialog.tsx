import { ActionsPanel, Typography } from '@linode/ui';
import React from 'react';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';

import type { Alert } from '@linode/api-v4';

interface AlertConfirmationDialogProps {
  /**
   * alert object of the selected row
   */
  alert: Alert;

  /**
   * Name of the selected entity
   */
  entityName: string;

  /**
   * Handler function for cancel button
   */
  handleCancel: () => void;

  /**
   * Handler function for enable/disable button
   * @param alert selected alert from the row
   * @param currentStatus current state of the toggle button
   */
  handleConfirm: (alert: Alert, currentStatus: boolean) => void;

  /**
   * Current state of the toggle button whether active or not
   */
  isActive: boolean;

  /**
   * Loading state of the confirmation dialog
   */
  isLoading?: boolean;

  /**
   * Current state of the confirmation dialoge whether open or not
   */
  isOpen: boolean;
}

export const AlertConfirmationDialog = React.memo(
  (props: AlertConfirmationDialogProps) => {
    const {
      alert,
      entityName,
      handleCancel,
      handleConfirm,
      isActive,
      isLoading = false,
      isOpen,
    } = props;

    const actionsPanel = (
      <ActionsPanel
        primaryButtonProps={{
          label: isActive ? 'Disable' : 'Enable',
          loading: isLoading,
          onClick: () => handleConfirm(alert, isActive),
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
        title={`${isActive ? 'Disable' : 'Enable'} ${alert.label} Alert?`}
      >
        <Typography variant="subtitle1">
          Are you sure you want to {isActive ? 'disable' : 'enable'} the alert
          for {entityName}?
        </Typography>
      </ConfirmationDialog>
    );
  }
);

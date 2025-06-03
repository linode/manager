import { ActionsPanel, Typography } from '@linode/ui';
import React from 'react';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';

import type { CloudPulseAlertsPayload } from '@linode/api-v4';

interface AlertContextualViewConfirmDialogProps {
  /**
   * Alert ids to be enabled/disabled
   */
  alertIds: CloudPulseAlertsPayload;

  /**
   * Name of the entity associated with the alerts
   */
  entityName: string;

  /**
   * Handler function for cancel button
   */
  handleCancel: () => void;

  /**
   * Handler function for enable/disable button
   * @param alertIds alert ids to be enabled/disabled
   */
  handleConfirm: (alertIds: CloudPulseAlertsPayload) => void;

  /**
   * Loading state of the confirmation dialog
   */
  isLoading?: boolean;
  /**
   * Current state of the confirmation dialoge whether open or not
   */
  isOpen: boolean;
}

export const AlertContextualViewConfirmDialog = React.memo(
  (props: AlertContextualViewConfirmDialogProps) => {
    const {
      alertIds,
      handleCancel,
      handleConfirm,
      isLoading = false,
      isOpen,
      entityName,
    } = props;

    const actionsPanel = (
      <ActionsPanel
        primaryButtonProps={{
          label: 'Save',
          loading: isLoading,
          onClick: () => handleConfirm(alertIds),
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
        title="Save Alerts?"
      >
        <Typography variant="subtitle2">
          {
            <span>
              Are you sure you want to save these settings for {entityName}? All
              legacy alert settings will be disabled and replaced by the new{' '}
              <b>Alerts(Beta)</b> settings.
            </span>
          }
        </Typography>
      </ConfirmationDialog>
    );
  }
);
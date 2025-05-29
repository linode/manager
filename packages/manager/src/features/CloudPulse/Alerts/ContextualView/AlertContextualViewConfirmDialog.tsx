import { ActionsPanel, Typography } from '@linode/ui';
import React from 'react';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';

import type { ServiceAlertsUpdatePayload } from '@linode/api-v4';

interface AlertContextualViewConfirmDialogProps {
  /**
   * Alert ids to be enabled/disabled
   */
  alertIds: ServiceAlertsUpdatePayload;

  /**
   * Id of the entity associated with the alerts
   */
  entityId: string;

  /**
   * Handler function for cancel button
   */
  handleCancel: () => void;

  /**
   * Handler function for enable/disable button
   * @param alertIds alert ids to be enabled/disabled
   */
  handleConfirm: (alertIds: ServiceAlertsUpdatePayload) => void;

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
      entityId,
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
        sx={{
          width: '500px',
          height: '275px',
          marginTop: '445px',
          marginLeft: '571px',
        }}
        title="Save Alerts?"
      >
        <Typography variant="subtitle2">
          {
            <span>
              Are you sure you want to save these settings for {entityId}?
              legacy alert settings will be disabled and replaced by the new{' '}
              <b>Alert(Beta)</b> settings.
            </span>
          }
        </Typography>
      </ConfirmationDialog>
    );
  }
);
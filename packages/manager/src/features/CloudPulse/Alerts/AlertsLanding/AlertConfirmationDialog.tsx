import { Typography } from '@linode/ui';
import React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';

interface AlertConfirmationDialogProps {
  /**
   * id of the selected alert row
   */
  alertId: number;

  /**
   * name of the selected alert row
   */
  alertName: string;

  /**
   * name of the selected entity
   */
  entityName: string;

  /**
   * handler function for cancel button
   */
  handleCancel: () => void;

  /**
   * handler function for enable/disable button
   * @param alertId id of the alert for the selected row
   * @param serviceType service type of the selected entity
   * @param currentStatus current state of the toggle button
   */
  handleConfirm: (
    alertId: number,
    serviceType: string,
    currentStatus: boolean
  ) => void;

  /**
   * current state of the toggle button whether active or not
   */
  isActive: boolean;

  /**
   * current state of the confirmation dialoge whether open or not
   */
  isOpen: boolean;

  /**
   * service type of the selected entity
   */
  serviceType: string;
}

export const AlertConfirmationDialog = React.memo(
  (props: AlertConfirmationDialogProps) => {
    const {
      alertId,
      alertName,
      entityName,
      handleCancel,
      handleConfirm,
      isActive,
      isOpen,
      serviceType,
    } = props;

    const actionsPanel = React.useCallback(() => {
      return (
        <ActionsPanel
          primaryButtonProps={{
            label: isActive ? 'Disable' : 'Enable',
            onClick: () => handleConfirm(alertId, serviceType, isActive),
          }}
          secondaryButtonProps={{
            label: 'Cancel',
            onClick: handleCancel,
          }}
        />
      );
    }, [alertId, handleCancel, handleConfirm, isActive, serviceType]);
    return (
      <ConfirmationDialog
        actions={actionsPanel}
        onClose={handleCancel}
        open={isOpen}
        title={`${isActive ? 'Disable' : 'Enable'} ${alertName} Alert?`}
      >
        <Typography variant="subtitle1">
          Are you sure you want to {isActive ? 'disable' : 'enable'} the alert
          for {entityName}?
        </Typography>
      </ConfirmationDialog>
    );
  }
);

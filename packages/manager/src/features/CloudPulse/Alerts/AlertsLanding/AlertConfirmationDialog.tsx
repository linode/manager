import { Typography } from '@linode/ui';
import { useSnackbar } from 'notistack';
import React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { useUpdateEntityToAlert } from 'src/queries/cloudpulse/alerts';

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
   * id of the selected entity
   */
  entityId: string;

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
   * @param id id of the alert for the selected row

   */
  handleClose: (id: number) => void;

  /**
   * current status of the toggle button whether active or not
   */
  isActive: boolean;

  /**
   * current status of the confirmation dialoge whether open or not
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
      entityId,
      entityName,
      handleCancel,
      handleClose,
      isActive,
      isOpen,
      serviceType,
    } = props;

    const { enqueueSnackbar } = useSnackbar();

    const { mutateAsync: updateEntity } = useUpdateEntityToAlert(
      serviceType,
      entityId,
      alertId,
      isActive
    );

    const handleUpdate = React.useCallback(() => {
      updateEntity()
        .then(() => {
          enqueueSnackbar(
            `The alert settings for ${entityName} saved successfully.`,
            { variant: 'success' }
          );
          handleClose(alertId);
        })
        .catch(() => {
          enqueueSnackbar(
            `${isActive ? 'Disabling' : 'Enabling'} alert failed`,
            {
              variant: 'error',
            }
          );
          handleCancel();
        });
    }, [
      isActive,
      enqueueSnackbar,
      entityName,
      handleCancel,
      handleClose,
      updateEntity,
      alertId,
    ]);

    const actionsPanel = React.useCallback(() => {
      return (
        <ActionsPanel
          primaryButtonProps={{
            label: isActive ? 'Disable' : 'Enable',
            onClick: handleUpdate,
          }}
          secondaryButtonProps={{
            label: 'Cancel',
            onClick: handleCancel,
          }}
        />
      );
    }, [handleCancel, handleUpdate, isActive]);
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

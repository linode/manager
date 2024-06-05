import React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { useLoadBalancerConfigurationDeleteMutation } from 'src/queries/aclb/configurations';

import type { Configuration } from '@linode/api-v4';

interface Props {
  configuration: Pick<Configuration, 'id' | 'label'>;
  loadbalancerId: number;
  onClose: () => void;
  open: boolean;
}

export const DeleteConfigurationDialog = (props: Props) => {
  const { configuration, loadbalancerId, onClose, open } = props;

  const {
    error,
    isLoading,
    mutateAsync,
    reset,
  } = useLoadBalancerConfigurationDeleteMutation(
    loadbalancerId,
    configuration.id
  );

  const handleClose = () => {
    // Clear the error when the dialog closes so that is does not persist
    reset();
    onClose();
  };

  const onDelete = async () => {
    try {
      await mutateAsync();
      handleClose();
    } catch (error) {
      // Swallow error
    }
  };

  return (
    <ConfirmationDialog
      actions={
        <ActionsPanel
          primaryButtonProps={{
            label: 'Delete',
            loading: isLoading,
            onClick: onDelete,
          }}
          secondaryButtonProps={{
            label: 'Cancel',
            onClick: handleClose,
          }}
        />
      }
      error={error?.[0]?.reason}
      onClose={handleClose}
      open={open}
      title={`Delete configuration ${configuration.label}`}
    >
      Are you sure you want to delete this configuration?
    </ConfirmationDialog>
  );
};

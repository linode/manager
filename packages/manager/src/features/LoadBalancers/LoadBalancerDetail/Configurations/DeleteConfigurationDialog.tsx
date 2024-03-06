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
  const { configuration, loadbalancerId, onClose: _onClose, open } = props;

  const {
    error,
    isLoading,
    mutateAsync,
    reset,
  } = useLoadBalancerConfigurationDeleteMutation(
    loadbalancerId,
    configuration.id
  );

  const onClose = () => {
    // Clear the error when the dialog closes so that is does not persist
    reset();
    _onClose();
  };

  const onDelete = async () => {
    try {
      await mutateAsync();
    } finally {
      onClose();
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
            onClick: onClose,
          }}
        />
      }
      error={error?.[0]?.reason}
      onClose={onClose}
      open={open}
      title={`Delete Configuration ${configuration.label}?`}
    >
      Are you sure you want to delete this configuration?
    </ConfirmationDialog>
  );
};

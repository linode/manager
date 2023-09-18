import React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { useLoadBalancerConfigurationDeleteMutation } from 'src/queries/aglb/configurations';

import type { Configuration } from '@linode/api-v4';

interface Props {
  configuration: Configuration;
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
  } = useLoadBalancerConfigurationDeleteMutation(
    loadbalancerId,
    configuration.id
  );

  const onDelete = async () => {
    await mutateAsync();
    onClose();
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

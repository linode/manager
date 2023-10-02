import { ServiceTarget } from '@linode/api-v4';
import React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { useLoadBalancerServiceTargetDeleteMutation } from 'src/queries/aglb/serviceTargets';

interface Props {
  loadbalancerId: number;
  onClose: () => void;
  open: boolean;
  serviceTarget: ServiceTarget | undefined;
}

export const DeleteServiceTargetDialog = (props: Props) => {
  const { loadbalancerId, onClose, open, serviceTarget } = props;

  const {
    error,
    isLoading,
    mutateAsync,
  } = useLoadBalancerServiceTargetDeleteMutation(
    loadbalancerId,
    serviceTarget?.id ?? -1
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
      title={`Delete Service Target ${serviceTarget?.label}?`}
    >
      Are you sure you want to delete this Service Target?
    </ConfirmationDialog>
  );
};

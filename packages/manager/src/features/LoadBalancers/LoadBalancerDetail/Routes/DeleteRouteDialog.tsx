import React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { useLoadBalancerRouteDeleteMutation } from 'src/queries/aclb/routes';

import type { Route } from '@linode/api-v4';

interface Props {
  loadbalancerId: number;
  onClose: () => void;
  open: boolean;
  route: Route | undefined;
}

export const DeleteRouteDialog = (props: Props) => {
  const { loadbalancerId, onClose, open, route } = props;

  const {
    error,
    isLoading,
    mutateAsync,
    reset,
  } = useLoadBalancerRouteDeleteMutation(loadbalancerId, route?.id ?? -1);

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
      title={`Delete Route ${route?.label}?`}
    >
      Are you sure you want to delete this route?
    </ConfirmationDialog>
  );
};

import React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { useLoadBalancerRouteUpdateMutation } from 'src/queries/aclb/routes';

import { getNormalizedRulePayload } from './utils';

import type { Route } from '@linode/api-v4';

interface Props {
  loadbalancerId: number;
  onClose: () => void;
  open: boolean;
  route: Route | undefined;
  ruleIndex: number | undefined;
}

export const DeleteRuleDialog = (props: Props) => {
  const { loadbalancerId, onClose, open, route, ruleIndex } = props;

  const {
    error,
    isLoading,
    mutateAsync,
    reset,
  } = useLoadBalancerRouteUpdateMutation(loadbalancerId, route?.id ?? -1);

  const handleClose = () => {
    // Clear the error when the dialog closes so that is does not persist
    reset();
    onClose();
  };

  const onDelete = async () => {
    if (!route || ruleIndex === undefined) {
      return;
    }

    const newRules = [...route.rules];

    newRules.splice(ruleIndex, 1);

    const normalizedRules = newRules.map(getNormalizedRulePayload);

    try {
      await mutateAsync({
        label: route.label,
        protocol: route.protocol,
        rules: normalizedRules,
      });
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
      title="Delete Rule"
    >
      Are you sure you want to delete this rule?
    </ConfirmationDialog>
  );
};

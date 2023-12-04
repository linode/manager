import React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { useLoadBalancerRouteUpdateMutation } from 'src/queries/aglb/routes';

import { getNormzlizedRulePayload } from './utils';

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

  const { error, isLoading, mutateAsync } = useLoadBalancerRouteUpdateMutation(
    loadbalancerId,
    route?.id ?? -1
  );

  const onDelete = async () => {
    if (!route || ruleIndex === undefined) {
      return;
    }

    const newRules = [...route.rules];

    newRules.splice(ruleIndex, 1);

    const normalizedRules = newRules.map(getNormzlizedRulePayload);

    await mutateAsync({
      label: route.label,
      protocol: route.protocol,
      rules: normalizedRules,
    });
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
      title="Delete Rule?"
    >
      Are you sure you want to delete this rule?
    </ConfirmationDialog>
  );
};

import * as React from 'react';

import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import { NO_PERMISSIONS_TOOLTIP_TEXT } from 'src/features/Firewalls/FirewallLanding/constants';
import { usePermissions } from 'src/features/IAM/hooks/usePermissions';

import type { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  firewallID: number;
  nodeBalancerId: number;
  onUnassign: () => void;
}

export const NodeBalancerFirewallsActionMenu = (props: Props) => {
  const { firewallID, onUnassign, nodeBalancerId } = props;

  const { data: firewallPermissions } = usePermissions(
    'firewall',
    ['delete_firewall_device'],
    firewallID
  );

  const { data: nodeBalancerPermissions } = usePermissions(
    'nodebalancer',
    ['update_nodebalancer'],
    nodeBalancerId
  );

  const disabledProps = !(
    firewallPermissions.delete_firewall_device &&
    nodeBalancerPermissions.update_nodebalancer
  )
    ? {
        disabled: true,
        tooltip: NO_PERMISSIONS_TOOLTIP_TEXT,
      }
    : {};

  const action: Action = {
    onClick: () => {
      onUnassign();
    },
    title: 'Unassign',
    ...disabledProps,
  };

  return (
    <InlineMenuAction
      actionText={action.title}
      data-qa-linode-firewalls-action-menu
      disabled={action.disabled}
      key={action.title}
      onClick={action.onClick}
      tooltip={action.tooltip}
    />
  );
};

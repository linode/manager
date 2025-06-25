import { useProfile, useUserEntityPermissions } from '@linode/queries';
import * as React from 'react';

import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import { NO_PERMISSIONS_TOOLTIP_TEXT } from 'src/features/Firewalls/FirewallLanding/constants';

import type { Action } from 'src/components/ActionMenu/ActionMenu';

interface LinodeFirewallsActionMenuProps {
  firewallID: number;
  linodeID: number;
  onUnassign: () => void;
}

export const LinodeFirewallsActionMenu = (
  props: LinodeFirewallsActionMenuProps
) => {
  const { linodeID, onUnassign } = props;

  const { data: profile } = useProfile();
  // const { data: grants } = useGrants();
  const { data: userEntityPermissions } = useUserEntityPermissions(
    'linode',
    linodeID,
    profile?.username ?? ''
  );
  // TODO: Switch to using the RBAC hook when it's ready UIE-8946
  const userCanModifyFirewall =
    // checkIfUserCanModifyFirewall(firewallID, profile, grants) ||
    userEntityPermissions?.includes('delete_firewall_device');

  const disabledProps = !userCanModifyFirewall
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

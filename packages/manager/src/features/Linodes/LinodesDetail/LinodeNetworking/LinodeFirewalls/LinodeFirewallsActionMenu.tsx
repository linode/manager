import * as React from 'react';

import { Action } from 'src/components/ActionMenu';
import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import { noPermissionTooltipText } from 'src/features/Firewalls/FirewallLanding/FirewallActionMenu';
import { useGrants, useProfile } from 'src/queries/profile';

interface LinodeFirewallsActionMenuProps {
  firewallID: number;
  onUnassign: () => void;
}

export const LinodeFirewallsActionMenu = (
  props: LinodeFirewallsActionMenuProps
) => {
  const { firewallID, onUnassign } = props;

  const { data: profile } = useProfile();
  const { data: grants } = useGrants();

  const userCanModifyFirewall =
    !profile?.restricted ||
    grants?.firewall?.find((firewall) => firewall.id === firewallID)
      ?.permissions === 'read_write';

  const disabledProps = !userCanModifyFirewall
    ? {
        disabled: true,
        tooltip: noPermissionTooltipText,
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
    />
  );
};

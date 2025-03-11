import * as React from 'react';

import { Action } from 'src/components/ActionMenu/ActionMenu';
import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import { noPermissionTooltipText } from 'src/features/Firewalls/FirewallLanding/FirewallActionMenu';
import { checkIfUserCanModifyFirewall } from 'src/features/Firewalls/shared';
import { useGrants, useProfile } from '@linode/queries';

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

  const userCanModifyFirewall = checkIfUserCanModifyFirewall(
    firewallID,
    profile,
    grants
  );

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

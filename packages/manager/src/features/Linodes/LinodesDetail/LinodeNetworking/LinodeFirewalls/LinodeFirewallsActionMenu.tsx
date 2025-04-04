import { useGrants, useProfile } from '@linode/queries';
import * as React from 'react';

import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import { NO_PERMISSIONS_TOOLTIP_TEXT } from 'src/features/Firewalls/FirewallLanding/constants';
import { checkIfUserCanModifyFirewall } from 'src/features/Firewalls/shared';

import type { Action } from 'src/components/ActionMenu/ActionMenu';

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
    />
  );
};

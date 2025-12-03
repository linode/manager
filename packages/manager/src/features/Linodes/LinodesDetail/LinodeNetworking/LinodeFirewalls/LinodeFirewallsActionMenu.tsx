import * as React from 'react';

import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import { NO_PERMISSIONS_TOOLTIP_TEXT } from 'src/features/Firewalls/FirewallLanding/constants';
import { usePermissions } from 'src/features/IAM/hooks/usePermissions';

import type { Action } from 'src/components/ActionMenu/ActionMenu';

interface LinodeFirewallsActionMenuProps {
  linodeID: number;
  onUnassign: () => void;
}

export const LinodeFirewallsActionMenu = (
  props: LinodeFirewallsActionMenuProps
) => {
  const { onUnassign, linodeID } = props;

  const { data: permissions } = usePermissions(
    'linode',
    ['update_linode'],
    linodeID
  );

  const disabledProps = !permissions.update_linode
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

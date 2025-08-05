import * as React from 'react';
import { useState } from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { usePermissions } from 'src/features/IAM/hooks/usePermissions';
import { useIsLinodeInterfacesEnabled } from 'src/utilities/linodes';

import {
  DEFAULT_FIREWALL_TOOLTIP_TEXT,
  NO_PERMISSIONS_TOOLTIP_TEXT,
} from './constants';

import type { FirewallStatus } from '@linode/api-v4/lib/firewalls';
import type { Action } from 'src/components/ActionMenu/ActionMenu';

export interface ActionHandlers {
  [index: string]: any;
  triggerDeleteFirewall: (firewallID: number, firewallLabel: string) => void;
  triggerDisableFirewall: (firewallID: number, firewallLabel: string) => void;
  triggerEnableFirewall: (firewallID: number, firewallLabel: string) => void;
}

interface Props extends ActionHandlers {
  firewallID: number;
  firewallLabel: string;
  firewallStatus: FirewallStatus;
  isDefaultFirewall: boolean;
}

export const FirewallActionMenu = React.memo((props: Props) => {
  const { isLinodeInterfacesEnabled } = useIsLinodeInterfacesEnabled();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const {
    firewallID,
    firewallLabel,
    firewallStatus,
    isDefaultFirewall,
    triggerDeleteFirewall,
    triggerDisableFirewall,
    triggerEnableFirewall,
  } = props;

  const { data: permissions, isLoading } = usePermissions(
    'firewall',
    ['update_firewall', 'delete_firewall'],
    firewallID,
    isOpen
  );

  const disabledProps = (hasPermission: boolean) =>
    !hasPermission || (isLinodeInterfacesEnabled && isDefaultFirewall)
      ? {
          disabled: true,
          tooltip: isDefaultFirewall
            ? DEFAULT_FIREWALL_TOOLTIP_TEXT
            : NO_PERMISSIONS_TOOLTIP_TEXT,
        }
      : {};

  const actions: Action[] = [
    {
      onClick: () => {
        handleEnableDisable();
      },
      title: firewallStatus === 'enabled' ? 'Disable' : 'Enable',
      ...disabledProps(permissions.update_firewall),
    },
    {
      onClick: () => {
        triggerDeleteFirewall(firewallID, firewallLabel);
      },
      title: 'Delete',
      ...disabledProps(permissions.delete_firewall),
    },
  ];

  const handleEnableDisable = () => {
    const request = () =>
      firewallStatus === 'disabled'
        ? triggerEnableFirewall(firewallID, firewallLabel)
        : triggerDisableFirewall(firewallID, firewallLabel);
    request();
  };

  return (
    <ActionMenu
      actionsList={actions}
      ariaLabel={`Action menu for Firewall ${props.firewallLabel}`}
      loading={isLoading}
      onOpen={() => setIsOpen(true)}
    />
  );
});

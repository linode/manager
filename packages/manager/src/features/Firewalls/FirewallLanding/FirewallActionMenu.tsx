import { useTheme } from '@linode/ui';
import { useMediaQuery } from '@mui/material';
import * as React from 'react';
import { useState } from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import { useIsIAMEnabled } from 'src/features/IAM/hooks/useIsIAMEnabled';
import { usePermissions } from 'src/features/IAM/hooks/usePermissions';
import { useIsLinodeInterfacesEnabled } from 'src/utilities/linodes';

import {
  DEFAULT_FIREWALL_TOOLTIP_TEXT,
  NO_PERMISSIONS_TOOLTIP_TEXT,
} from './constants';

import type { FirewallStatus } from '@linode/api-v4/lib/firewalls';
import type { Theme } from '@mui/material';
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
  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('md'));
  const { isIAMEnabled } = useIsIAMEnabled();
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

  const { permissions } = usePermissions(
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
    <>
      {!isIAMEnabled &&
        !matchesSmDown &&
        actions.map((action) => {
          return (
            <InlineMenuAction
              actionText={action.title}
              aria-label={`${action.title} ${props.firewallLabel}`}
              disabled={action.disabled}
              key={action.title}
              onClick={action.onClick}
              tooltip={action.tooltip}
            />
          );
        })}
      {isIAMEnabled ||
        (matchesSmDown && (
          <ActionMenu
            actionsList={actions}
            ariaLabel={`Action menu for Firewall ${props.firewallLabel}`}
            onOpen={() => setIsOpen(true)}
          />
        ))}
    </>
  );
});

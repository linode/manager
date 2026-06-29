import { Icon, Menu, MenuItem, Tooltip } from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import * as React from 'react';

import type { Action } from '../types';
import type { IPAddress } from '@linode/api-v4';

export interface ReservedIpsActionHandlers {
  onEdit: (ip: IPAddress) => void;
  onUnreserve: (ip: IPAddress) => void;
}

interface Props {
  handlers: ReservedIpsActionHandlers;
  ip: IPAddress;
}

export const ReservedIpsActionMenu = ({ handlers, ip }: Props) => {
  const actions: Action[] = [
    {
      onClick: () => handlers.onEdit(ip),
      pendoId: 'Reserved IPs Landing-Edit',
      title: 'Edit',
    },
    {
      onClick: () => handlers.onUnreserve(ip),
      pendoId: 'Reserved IPs Landing-Unreserve Start Flow',
      title: 'Unreserve',
    },
  ];

  return (
    <Menu
      aria-label={`Action menu for Reserved IP ${ip.address}`}
      data-pendo-id="Reserved IPs Landing-Action Menu"
      data-testid="reserved-ip-action-menu"
      icon="actions"
      position="bottom-right"
    >
      {actions.map((action) => (
        <MenuItem
          data-pendo-id={action.pendoId}
          data-testid={action.title}
          disabled={action.disabled}
          key={action.title}
          onSelect={action.onClick}
          style={{
            minWidth: '210px',
            paddingRight: Spacing.S4,
          }}
          title={action.title}
          value={action.title}
        >
          <span
            style={{
              alignItems: 'center',
              display: 'flex',
              justifyContent: 'space-between',
              minWidth: '210px',
            }}
          >
            {action.title}
            {action.disabled && action.tooltip ? (
              <Tooltip
                disabled={!action.disabled}
                key={action.title}
                noArrow={true}
                style={{ textAlign: 'left', whiteSpace: 'normal' }}
                tooltipPlacement="left"
                tooltipText={action.tooltip}
              >
                <Icon icon="info-outline" size="m" />
              </Tooltip>
            ) : null}
          </span>
        </MenuItem>
      ))}
    </Menu>
  );
};

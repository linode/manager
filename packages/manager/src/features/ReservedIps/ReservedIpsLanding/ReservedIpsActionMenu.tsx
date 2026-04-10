import * as React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';

import type { IPAddress } from '@linode/api-v4';
import type { Action } from 'src/components/ActionMenu/ActionMenu';

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
      title: 'Edit',
    },
    {
      onClick: () => handlers.onUnreserve(ip),
      title: 'Unreserve',
    },
  ];

  return (
    <ActionMenu
      actionsList={actions}
      ariaLabel={`Action menu for Reserved IP ${ip.address}`}
    />
  );
};

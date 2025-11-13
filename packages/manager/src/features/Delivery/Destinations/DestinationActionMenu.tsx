import * as React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';

import type { Destination } from '@linode/api-v4';
import type { Action } from 'src/components/ActionMenu/ActionMenu';

export interface DestinationHandlers {
  onDelete: (destination: Destination) => void;
  onEdit: (destination: Destination) => void;
}

interface DestinationActionMenuProps extends DestinationHandlers {
  destination: Destination;
}

export const DestinationActionMenu = (props: DestinationActionMenuProps) => {
  const { destination, onDelete, onEdit } = props;

  const menuActions: Action[] = [
    {
      onClick: () => {
        onEdit(destination);
      },
      title: 'Edit',
      pendoId: 'Logs Delivery Destinations-Edit',
    },
    {
      onClick: () => {
        onDelete(destination);
      },
      title: 'Delete',
      pendoId: 'Logs Delivery Destinations-Delete',
    },
  ];

  return (
    <ActionMenu
      actionsList={menuActions}
      ariaLabel={`Action menu for Destination ${destination.label}`}
      pendoId="Logs Delivery Destinations-Action Menu"
    />
  );
};

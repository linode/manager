import * as React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';

import type { Destination } from '@linode/api-v4';

export interface DestinationHandlers {
  onDelete: (destination: Destination) => void;
  onEdit: (destination: Destination) => void;
}

interface DestinationActionMenuProps extends DestinationHandlers {
  destination: Destination;
}

export const DestinationActionMenu = (props: DestinationActionMenuProps) => {
  const { destination, onDelete, onEdit } = props;

  const menuActions = [
    {
      onClick: () => {
        onEdit(destination);
      },
      title: 'Edit',
    },
    {
      onClick: () => {
        onDelete(destination);
      },
      title: 'Delete',
    },
  ];

  return (
    <ActionMenu
      actionsList={menuActions}
      ariaLabel={`Action menu for Destination ${destination.label}`}
    />
  );
};

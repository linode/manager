import React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';

import type { LinodeInterfaceType } from './utilities';

interface Props {
  handlers: InterfaceActionHandlers;
  id: number;
  type: LinodeInterfaceType;
}

export interface InterfaceActionHandlers {
  onDelete: (interfaceId: number) => void;
  onEdit: (interfaceId: number) => void;
  onShowDetails: (interfaceId: number) => void;
}

export const LinodeInterfaceActionMenu = (props: Props) => {
  const { handlers, id, type } = props;

  const editOptions =
    type === 'VLAN'
      ? {
          disabled: true,
          tooltip: 'VLAN interfaces cannot be edited.',
        }
      : {};

  const actions = [
    { onClick: () => handlers.onShowDetails(id), title: 'Details' },
    {
      onClick: () => handlers.onEdit(id),
      title: 'Edit',
      ...editOptions,
    },
    { onClick: () => handlers.onDelete(id), title: 'Delete' },
  ];

  return (
    <ActionMenu
      actionsList={actions}
      ariaLabel={`Action menu for ${type} Interface (${id})`}
    />
  );
};

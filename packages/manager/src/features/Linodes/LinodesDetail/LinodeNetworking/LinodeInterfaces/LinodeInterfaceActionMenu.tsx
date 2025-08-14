import React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';

import type { LinodeInterfaceType } from './utilities';

const NO_PERMISSION_TOOLTIP_TEXT =
  'You do not have permission to perform this action.';

interface Props {
  disabled: boolean;
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
  const { disabled, handlers, id, type } = props;

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
      disabled,
      tooltip: disabled ? NO_PERMISSION_TOOLTIP_TEXT : undefined,
    },
    {
      onClick: () => handlers.onDelete(id),
      disabled,
      title: 'Delete',
      tooltip: disabled ? NO_PERMISSION_TOOLTIP_TEXT : undefined,
    },
  ];

  return (
    <ActionMenu
      actionsList={actions}
      ariaLabel={`Action menu for ${type} Interface (${id})`}
    />
  );
};

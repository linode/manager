import { useLinodeQuery } from '@linode/queries';
import React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { LINODE_LOCKED_DELETE_INTERFACE_TOOLTIP } from 'src/features/Linodes/constants';

import type { LinodeInterfaceType } from './utilities';

interface Props {
  handlers: InterfaceActionHandlers;
  id: number;
  linodeId: number;
  type: LinodeInterfaceType;
}

export interface InterfaceActionHandlers {
  onDelete: (interfaceId: number) => void;
  onEdit: (interfaceId: number) => void;
  onShowDetails: (interfaceId: number) => void;
}

export const LinodeInterfaceActionMenu = (props: Props) => {
  const { handlers, id, linodeId, type } = props;

  const { data: linode } = useLinodeQuery(linodeId);
  const isLinodeSubResourcesLocked =
    linode?.locks?.includes('cannot_delete_with_subresources') ?? false;

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
    {
      disabled: isLinodeSubResourcesLocked,
      onClick: () => handlers.onDelete(id),
      title: 'Delete',
      tooltip: isLinodeSubResourcesLocked
        ? LINODE_LOCKED_DELETE_INTERFACE_TOOLTIP
        : undefined,
    },
  ];

  return (
    <ActionMenu
      actionsList={actions}
      ariaLabel={`Action menu for ${type} Interface (${id})`}
    />
  );
};

import React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';

import type { InterfaceType } from './utilities';

interface Props {
  id: number;
  type: InterfaceType;
}

export const LinodeInterfaceActionMenu = (props: Props) => {
  const { id, type } = props;

  const actions = [
    { onClick: () => alert(`Details ${id}`), title: 'Details' },
    { onClick: () => alert(`Edit ${id}`), title: 'Edit' },
    { onClick: () => alert(`Delete ${id}`), title: 'Delete' },
  ];

  return (
    <ActionMenu
      actionsList={actions}
      ariaLabel={`Action menu for ${type} Interface (${id})`}
    />
  );
};

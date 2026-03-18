import React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';

import type { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  deleteButtonDisabled: boolean;
}
export const ShareGroupActionMenu = (props: Props) => {
  const { deleteButtonDisabled } = props;
  /* TODO: Implement action menu logic for each corresponding action */
  const actions: Action[] = [
    {
      title: 'Edit Group Details',
      onClick: () => {},
      disabled: false,
      hidden: false,
      pendoId: 'Images Groups Owned-Group Action menu Edit Group Details',
    },
    {
      title: 'Add Images',
      onClick: () => {},
      disabled: false,
      hidden: false,
      pendoId: 'Images Groups Owned-Group Action menu Add Images',
    },
    {
      title: 'Add Members',
      onClick: () => {},
      disabled: false,
      hidden: false,
      pendoId: 'Images Groups Owned-Group Action menu Add Members',
    },
    {
      title: 'Delete',
      onClick: () => {},
      disabled: deleteButtonDisabled,
      hidden: false,
      tooltip: deleteButtonDisabled
        ? 'Before deleting this share group, revoke access for all members first.'
        : undefined,
      pendoId: 'Images Groups Owned-Group Action menu Delete',
    },
  ];

  return (
    <ActionMenu
      actionsList={actions}
      ariaLabel="Action menu for share group"
      data-pendo-id="Images Groups Owned-Group Action menu"
    />
  );
};

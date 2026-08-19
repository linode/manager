import React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';

import type { Sharegroup } from '@linode/api-v4';
import type { Action } from 'src/components/ActionMenu/ActionMenu';

export interface Handlers {
  onAddImages?: (shareGroupId: string) => void;
  onAddMembers?: (shareGroupId: string) => void;
  onDelete?: (shareGroupId: string) => void;
  onEdit?: (shareGroupId: string) => void;
}

interface Props {
  deleteButtonDisabled: boolean;
  handlers?: Handlers;
  shareGroup: Sharegroup;
}

export const ShareGroupActionMenu = (props: Props) => {
  const { deleteButtonDisabled, handlers, shareGroup } = props;
  const { onAddMembers, onAddImages, onDelete, onEdit } = handlers ?? {};
  const shareGroupId = String(shareGroup.id);

  const actions: Action[] = [
    {
      title: 'Edit Group Details',
      onClick: () => onEdit?.(shareGroupId),
      disabled: false,
      hidden: false,
      pendoId: 'Images Groups Owned-Edit Group Details',
    },
    {
      title: 'Add Images',
      onClick: () => onAddImages?.(shareGroupId),
      disabled: false,
      hidden: false,
      pendoId: 'Images Groups Owned-Add Images',
    },
    {
      title: 'Add Members',
      onClick: () => onAddMembers?.(shareGroupId),
      disabled: false,
      hidden: false,
      pendoId: 'Images Groups Owned-Add Members',
    },
    {
      title: 'Delete',
      onClick: () => onDelete?.(shareGroupId),
      disabled: deleteButtonDisabled,
      hidden: false,
      tooltip: deleteButtonDisabled
        ? 'Before deleting this share group, revoke access for all members first.'
        : undefined,
      pendoId: deleteButtonDisabled
        ? 'Images Groups Owned-Disabled Delete'
        : 'Images Groups Owned-Delete',
    },
  ];

  return (
    <ActionMenu
      actionsList={actions}
      ariaLabel="Action menu for share group"
      pendoId="Images Groups Owned-Action menu"
    />
  );
};

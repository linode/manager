import * as React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { getRestrictedResourceText } from 'src/features/Account/utils';
import { usePermissions } from 'src/features/IAM/hooks/usePermissions';

import type { Volume } from '@linode/api-v4';
import type { Action } from 'src/components/ActionMenu/ActionMenu';

export interface ActionHandlers {
  handleAttach: () => void;
  handleClone: () => void;
  handleDelete: () => void;
  handleDetach: () => void;
  handleDetails: () => void;
  handleEdit: () => void;
  handleManageTags: () => void;
  handleResize: () => void;
  handleUpgrade: () => void;
}

export interface Props {
  handlers: ActionHandlers;
  isVolumesLanding: boolean;
  volume: Volume;
}

export const VolumesActionMenu = (props: Props) => {
  const { handlers, isVolumesLanding, volume } = props;

  const attached = volume.linode_id !== null;

  const { data: accountPermissions } = usePermissions('account', [
    'create_volume',
  ]);
  const { data: volumePermissions } = usePermissions(
    'volume',
    [
      'delete_volume',
      'view_volume',
      'resize_volume',
      'clone_volume',
      'attach_volume',
      'detach_volume',
      'update_volume',
    ],
    volume.id
  );

  const actions: Action[] = [
    {
      onClick: handlers.handleDetails,
      title: 'Show Config',
    },
    {
      disabled: !volumePermissions?.update_volume,
      onClick: handlers.handleEdit,
      title: 'Edit',
      tooltip: !volumePermissions?.update_volume
        ? getRestrictedResourceText({
            action: 'edit',
            isSingular: true,
            resourceType: 'Volumes',
          })
        : undefined,
    },
    {
      disabled: !volumePermissions?.update_volume,
      onClick: handlers.handleManageTags,
      title: 'Manage Tags',
    },
    {
      disabled: !volumePermissions?.resize_volume,
      onClick: handlers.handleResize,
      title: 'Resize',
      tooltip: !volumePermissions?.resize_volume
        ? getRestrictedResourceText({
            action: 'resize',
            isSingular: true,
            resourceType: 'Volumes',
          })
        : undefined,
    },
    {
      disabled:
        !volumePermissions?.clone_volume || !accountPermissions?.create_volume,
      onClick: handlers.handleClone,
      title: 'Clone',
      tooltip: !volumePermissions?.clone_volume
        ? getRestrictedResourceText({
            action: 'clone',
            isSingular: true,
            resourceType: 'Volumes',
          })
        : undefined,
    },
  ];

  if (!attached && isVolumesLanding) {
    actions.push({
      disabled: !volumePermissions?.attach_volume,
      onClick: handlers.handleAttach,
      title: 'Attach',
      tooltip: !volumePermissions?.attach_volume
        ? getRestrictedResourceText({
            action: 'attach',
            isSingular: true,
            resourceType: 'Volumes',
          })
        : undefined,
    });
  } else {
    actions.push({
      disabled: !volumePermissions?.detach_volume,
      onClick: handlers.handleDetach,
      title: 'Detach',
      tooltip: !volumePermissions?.detach_volume
        ? getRestrictedResourceText({
            action: 'detach',
            isSingular: true,
            resourceType: 'Volumes',
          })
        : undefined,
    });
  }

  actions.push({
    disabled: !volumePermissions?.delete_volume || attached,
    onClick: handlers.handleDelete,
    title: 'Delete',
    tooltip: !volumePermissions?.delete_volume
      ? getRestrictedResourceText({
          action: 'delete',
          isSingular: true,
          resourceType: 'Volumes',
        })
      : attached
        ? 'Your volume must be detached before it can be deleted.'
        : undefined,
  });

  return (
    <ActionMenu
      actionsList={actions}
      ariaLabel={`Action menu for Volume ${volume.label}`}
    />
  );
};

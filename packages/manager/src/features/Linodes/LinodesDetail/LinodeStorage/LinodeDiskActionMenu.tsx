import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { usePermissions } from 'src/features/IAM/hooks/usePermissions';

import type { Disk, Linode } from '@linode/api-v4';
import type { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  disk: Disk;
  linodeId: number;
  linodeStatus: Linode['status'];
  onDelete: () => void;
  onRename: () => void;
  onResize: () => void;
}

export const LinodeDiskActionMenu = (props: Props) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState<boolean>(false);

  const { disk, linodeId, linodeStatus, onDelete, onRename, onResize } = props;

  const { data: permissions, isLoading } = usePermissions(
    'linode',
    ['update_linode', 'resize_linode', 'delete_linode', 'clone_linode'],
    linodeId,
    isOpen
  );

  const { data: imagePermissions } = usePermissions('account', [
    'create_image',
  ]);

  const poweredOnTooltip =
    linodeStatus !== 'offline'
      ? 'Your Linode must be fully powered down in order to perform this action.'
      : undefined;

  const swapTooltip =
    disk.filesystem == 'swap'
      ? 'You cannot create images from Swap images.'
      : undefined;

  const noPermissionTooltip =
    'You do not have permission to perform this action.';

  const actions: Action[] = [
    {
      disabled: !permissions.update_linode,
      onClick: onRename,
      title: 'Rename',
      tooltip: !permissions.update_linode ? noPermissionTooltip : undefined,
    },
    {
      disabled: !permissions.resize_linode || linodeStatus !== 'offline',
      onClick: onResize,
      title: 'Resize',
      tooltip: !permissions.resize_linode
        ? noPermissionTooltip
        : poweredOnTooltip,
    },
    {
      disabled: !imagePermissions.create_image || !!swapTooltip,
      onClick: () =>
        navigate({
          to: `/images/create/disk`,
          search: {
            selectedLinode: String(linodeId),
            selectedDisk: String(disk.id),
          },
        }),
      title: 'Create Disk Image',
      tooltip: !imagePermissions.create_image
        ? noPermissionTooltip
        : swapTooltip,
    },
    {
      disabled: !permissions.clone_linode,
      onClick: () => {
        navigate({
          to: `/linodes/${linodeId}/clone/disks`,
          search: {
            selectedDisk: String(disk.id),
          },
        });
      },
      tooltip: !permissions.clone_linode ? noPermissionTooltip : undefined,
      title: 'Clone',
    },
    {
      disabled: !permissions.delete_linode || linodeStatus !== 'offline',
      onClick: onDelete,
      title: 'Delete',
      tooltip: !permissions.delete_linode
        ? noPermissionTooltip
        : poweredOnTooltip,
    },
  ];

  return (
    <ActionMenu
      actionsList={actions}
      ariaLabel={`Action menu for Disk ${disk.label}`}
      loading={isLoading}
      onOpen={() => setIsOpen(true)}
    />
  );
};

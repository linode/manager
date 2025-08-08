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
  readOnly?: boolean;
}

export const LinodeDiskActionMenu = (props: Props) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState<boolean>(false);

  const {
    disk,
    linodeId,
    linodeStatus,
    onDelete,
    onRename,
    onResize,
    readOnly,
  } = props;

  const { data: permissions } = usePermissions(
    'linode',
    ['update_linode', 'resize_linode', 'delete_linode', 'clone_linode'],
    linodeId,
    isOpen
  );

  const poweredOnTooltip =
    linodeStatus !== 'offline'
      ? 'Your Linode must be fully powered down in order to perform this action'
      : undefined;

  const swapTooltip =
    disk.filesystem == 'swap'
      ? 'You cannot create images from Swap images.'
      : undefined;

  const actions: Action[] = [
    {
      disabled: !permissions.update_linode,
      onClick: onRename,
      title: 'Rename',
    },
    {
      disabled: !permissions.resize_linode || linodeStatus !== 'offline',
      onClick: onResize,
      title: 'Resize',
      tooltip: poweredOnTooltip,
    },
    {
      disabled: readOnly || !!swapTooltip,
      onClick: () =>
        navigate({
          to: `/images/create/disk`,
          search: {
            selectedLinode: String(linodeId),
            selectedDisk: String(disk.id),
          },
        }),
      title: 'Create Disk Image',
      tooltip: swapTooltip,
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
      title: 'Clone',
    },
    {
      disabled: !permissions.delete_linode || linodeStatus !== 'offline',
      onClick: onDelete,
      title: 'Delete',
      tooltip: poweredOnTooltip,
    },
  ];

  return (
    <ActionMenu
      actionsList={actions}
      ariaLabel={`Action menu for Disk ${disk.label}`}
      onOpen={() => setIsOpen(true)}
    />
  );
};

import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { NO_PERMISSION_TOOLTIP_TEXT } from 'src/constants';
import { usePermissions } from 'src/features/IAM/hooks/usePermissions';

import type { Config } from '@linode/api-v4/lib/linodes';
import type { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  config: Config;
  label: string;
  linodeId: number;
  onBoot: () => void;
  onDelete: () => void;
  onEdit: () => void;
}

export const ConfigActionMenu = (props: Props) => {
  const { config, linodeId, onBoot, onDelete, onEdit } = props;
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const navigate = useNavigate();

  const { data: permissions, isLoading } = usePermissions(
    'linode',
    ['reboot_linode', 'update_linode', 'clone_linode', 'delete_linode'],
    linodeId,
    isOpen
  );

  const actions: Action[] = [
    {
      disabled: !permissions.reboot_linode,
      onClick: onBoot,
      title: 'Boot',
      tooltip: !permissions.reboot_linode
        ? NO_PERMISSION_TOOLTIP_TEXT
        : undefined,
    },
    {
      disabled: !permissions.update_linode,
      onClick: onEdit,
      title: 'Edit',
      tooltip: !permissions.update_linode
        ? NO_PERMISSION_TOOLTIP_TEXT
        : undefined,
    },
    {
      disabled: !permissions.clone_linode,
      onClick: () => {
        navigate({
          to: `/linodes/${linodeId}/clone/configs`,
          search: (prev) => ({
            ...prev,
            selectedConfig: config.id,
          }),
        });
      },
      title: 'Clone',
      tooltip: !permissions.clone_linode
        ? NO_PERMISSION_TOOLTIP_TEXT
        : undefined,
    },
    {
      disabled: !permissions.delete_linode,
      onClick: onDelete,
      title: 'Delete',
      tooltip: !permissions.delete_linode
        ? NO_PERMISSION_TOOLTIP_TEXT
        : undefined,
    },
  ];

  return (
    <ActionMenu
      actionsList={actions}
      ariaLabel={`Action menu for Linode Config ${props.label}`}
      loading={isLoading}
      onOpen={() => setIsOpen(true)}
    />
  );
};

import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';
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
  const navigate = useNavigate();

  const { permissions } = usePermissions(
    'linode',
    [
      'reboot_linode',
      'update_linode_config_profile',
      'clone_linode',
      'delete_linode_config_profile',
    ],
    linodeId
  );

  const tooltip = !permissions.delete_linode_config_profile
    ? "You don't have permission to perform this action"
    : undefined;

  const actions: Action[] = [
    {
      disabled: !permissions.reboot_linode,
      onClick: onBoot,
      title: 'Boot',
    },
    {
      disabled: !permissions.update_linode_config_profile,
      onClick: onEdit,
      title: 'Edit',
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
    },
    {
      disabled: !permissions.delete_linode_config_profile,
      onClick: onDelete,
      title: 'Delete',
      tooltip,
    },
  ];

  return (
    <ActionMenu
      actionsList={actions}
      ariaLabel={`Action menu for Linode Config ${props.label}`}
    />
  );
};

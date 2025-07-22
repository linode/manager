import * as React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';

import type { LinodeBackup, PermissionType } from '@linode/api-v4/lib/linodes';
import type { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  backup: LinodeBackup;
  onDeploy: () => void;
  onRestore: () => void;
  permissions: Record<PermissionType, boolean>;
}

export const LinodeBackupActionMenu = (props: Props) => {
  const { backup, onDeploy, onRestore, permissions } = props;
  const disabledPropsForRestore = {
    disabled: !permissions.update_linode,
    tooltip: !permissions.update_linode
      ? "You don't have permission to deploy from this Linode\u{2019}s backups"
      : undefined,
  };

  const disabledPropsForDeployNew = {
    disabled: !permissions.create_linode,
    tooltip: !permissions.create_linode
      ? "You don't have permission to deploy from this Linode\u{2019}s backups"
      : undefined,
  };

  const actions: Action[] = [
    {
      onClick: () => {
        onRestore();
      },
      title: 'Restore to Existing Linode',
      ...disabledPropsForRestore,
    },
    {
      onClick: () => {
        onDeploy();
      },
      title: 'Deploy New Linode',
      ...disabledPropsForDeployNew,
    },
  ];

  return (
    <ActionMenu
      actionsList={actions}
      ariaLabel={`Action menu for Backup ${backup.label}`}
    />
  );
};

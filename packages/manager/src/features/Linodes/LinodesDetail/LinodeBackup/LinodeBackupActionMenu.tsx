import * as React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { usePermissions } from 'src/features/IAM/hooks/usePermissions';

import type { LinodeBackup } from '@linode/api-v4/lib/linodes';
import type { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  backup: LinodeBackup;
  linodeId: number;
  onDeploy: () => void;
  onRestore: () => void;
}

export const LinodeBackupActionMenu = (props: Props) => {
  const { backup, linodeId, onDeploy, onRestore } = props;
  const [isOpen, setIsOpen] = React.useState<boolean>(false);

  const { data: accountPermissions } = usePermissions('account', [
    'create_linode',
  ]);
  const { data: linodePermissions, isLoading } = usePermissions(
    'linode',
    ['update_linode'],
    linodeId,
    isOpen
  );

  const disabledPropsForRestore = {
    disabled: !linodePermissions.update_linode,
    tooltip: !linodePermissions.update_linode
      ? "You don't have permission to deploy from this Linode\u{2019}s backups"
      : undefined,
  };

  const disabledPropsForDeployNew = {
    disabled: !accountPermissions.create_linode,
    tooltip: !accountPermissions.create_linode
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
      loading={isLoading}
      onOpen={() => setIsOpen(true)}
    />
  );
};

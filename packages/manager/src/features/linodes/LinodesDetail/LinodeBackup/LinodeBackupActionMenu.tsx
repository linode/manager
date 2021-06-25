import { LinodeBackup } from '@linode/api-v4/lib/linodes';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import ActionMenu, { Action } from 'src/components/ActionMenu_CMR';

interface Props {
  backup: LinodeBackup;
  disabled: boolean;
  onRestore: (backup: LinodeBackup) => void;
  onDeploy: (backup: LinodeBackup) => void;
}

type CombinedProps = Props & RouteComponentProps<{}>;

export const LinodeBackupActionMenu: React.FC<CombinedProps> = (props) => {
  const { backup, disabled, onRestore, onDeploy } = props;
  const disabledProps = {
    disabled,
    tooltip: disabled
      ? "You don't have permission to deploy from this Linode's backups"
      : undefined,
  };

  const actions: Action[] = [
    {
      title: 'Restore to Existing Linode',
      onClick: () => {
        onRestore(backup);
      },
      ...disabledProps,
    },
    {
      title: 'Deploy New Linode',
      onClick: () => {
        onDeploy(backup);
      },
      ...disabledProps,
    },
  ];

  return (
    <ActionMenu
      actionsList={actions}
      ariaLabel={`Action menu for Backup ${props.backup.label}`}
    />
  );
};

export default withRouter(LinodeBackupActionMenu);

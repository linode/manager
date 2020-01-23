import { LinodeBackup } from 'linode-js-sdk/lib/linodes';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  backup: LinodeBackup;
  disabled: boolean;
  onRestore: (backup: LinodeBackup) => void;
  onDeploy: (backup: LinodeBackup) => void;
}

type CombinedProps = Props & RouteComponentProps<{}>;

class LinodeBackupActionMenu extends React.Component<CombinedProps> {
  createActions = () => {
    const { backup, disabled, onRestore, onDeploy } = this.props;
    const disabledProps = {
      disabled,
      tooltip: disabled
        ? "You don't have permission to deploy from this Linode's backups"
        : undefined
    };

    return (closeMenu: Function): Action[] => {
      const actions = [
        {
          title: 'Restore to Existing Linode',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            onRestore(backup);
            closeMenu();
            e.preventDefault();
          },
          ...disabledProps
        },
        {
          title: 'Deploy New Linode',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            onDeploy(backup);
            closeMenu();
            e.preventDefault();
          },
          ...disabledProps
        }
      ];
      return actions;
    };
  };

  render() {
    return (
      <ActionMenu
        createActions={this.createActions()}
        ariaLabel={`Action menu for Backup ${this.props.backup.label}`}
      />
    );
  }
}

export default withRouter(LinodeBackupActionMenu);

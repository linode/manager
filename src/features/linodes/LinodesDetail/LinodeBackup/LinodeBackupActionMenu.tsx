import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  backup: Linode.LinodeBackup;
  onRestore: (backup:Linode.LinodeBackup) => void;
  onDeploy: (backup:Linode.LinodeBackup) => void;
}

type CombinedProps = Props & RouteComponentProps<{}>;

class LinodeBackupActionMenu extends React.Component<CombinedProps> {
  createActions = () => {
    const {
      backup,
      onRestore,
      onDeploy,
    } = this.props;

    return (closeMenu: Function): Action[] => {
      const actions = [
        {
          title: 'Restore to Existing Linode',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            onRestore(backup);
            closeMenu();
            e.preventDefault();
          },
        },
        {
          title: 'Deploy New Linode',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            onDeploy(backup);
            closeMenu();
            e.preventDefault();
          },
        },
      ];
      return actions;
    };
  }

  render() {
    return (
      <ActionMenu createActions={this.createActions()} />
    );
  }
}

export default withRouter(LinodeBackupActionMenu);

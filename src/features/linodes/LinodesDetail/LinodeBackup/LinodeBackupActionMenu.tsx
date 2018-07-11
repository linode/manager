import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  onRestore: () => void;
  onDeploy: () => void;
}

type CombinedProps = Props & RouteComponentProps<{}>;

class LinodeBackupActionMenu extends React.Component<CombinedProps> {
  createActions = () => {
    const {
      onRestore,
      onDeploy,
    } = this.props;

    return function (closeMenu: Function): Action[] {
      const actions = [
        {
          title: 'Restore to Existing Linode',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            onRestore();
            closeMenu();
            e.preventDefault();
          },
        },
        {
          title: 'Deploy New Linode',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            onDeploy();
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

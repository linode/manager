import * as React from 'react';

import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  sshKeyID: number
}

type CombinedProps = Props;

class SSHKeyActionMenu extends React.Component<CombinedProps> {
  createActions = () => {
    // const { sshKeyID } = this.props;

    return (closeMenu: Function): Action[] => {
      const actions = [
        {
          title: 'Delete',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
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

export default SSHKeyActionMenu;

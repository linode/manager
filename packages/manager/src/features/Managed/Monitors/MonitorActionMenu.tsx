import * as React from 'react';

import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  status: Linode.MonitorStatus;
}

export class MonitorActionMenu extends React.Component<Props, {}> {
  createActions = () => {
    const { status } = this.props;

    return (closeMenu: Function): Action[] => {
      const actions = [
        status === 'disabled'
          ? {
              title: 'Enable',
              onClick: () => closeMenu()
            }
          : {
              title: 'Disable',
              onClick: () => closeMenu()
            }
      ];
      return actions;
    };
  };

  render() {
    return <ActionMenu createActions={this.createActions()} />;
  }
}

export default MonitorActionMenu;

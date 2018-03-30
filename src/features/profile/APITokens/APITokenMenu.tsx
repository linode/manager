import * as React from 'react';

import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  openViewDrawer: () => void;
}

type CombinedProps = Props;

class APITokenMenu extends React.Component<CombinedProps> {
  createActions = () => {
    const { openViewDrawer } = this.props;

    return function (closeMenu: Function): Action[] {
      const actions = [
        {
          title: 'View Token Scopes',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            openViewDrawer();
            closeMenu();
          },
        },
        {
          title: 'Edit',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
          },
        },
        {
          title: 'Revoke',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
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

export default APITokenMenu;

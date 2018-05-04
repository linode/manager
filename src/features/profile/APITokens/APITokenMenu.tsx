import * as React from 'react';

import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  isAppTokenMenu: boolean;
  openViewDrawer: () => void;
  openEditDrawer: () => void;
  openRevokeDialog: () => void;
}

type CombinedProps = Props;

class APITokenMenu extends React.Component<CombinedProps> {
  createActions = () => {
    const { isAppTokenMenu, openViewDrawer, openEditDrawer, openRevokeDialog } = this.props;

    return function (closeMenu: Function): Action[] {
      const actions = (!isAppTokenMenu)
        ? [
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
              openEditDrawer();
              closeMenu();
            },
          },
          {
            title: 'Revoke',
            onClick: (e: React.MouseEvent<HTMLElement>) => {
              openRevokeDialog();
              closeMenu();
            },
          },
        ]
        : [
          {
            title: 'View Token Scopes',
            onClick: (e: React.MouseEvent<HTMLElement>) => {
              openViewDrawer();
              closeMenu();
            },
          },
          {
            title: 'Revoke',
            onClick: (e: React.MouseEvent<HTMLElement>) => {
              openRevokeDialog();
              closeMenu();
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

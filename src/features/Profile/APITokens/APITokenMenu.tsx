import * as React from 'react';

import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  token: Linode.Token;
  type: string;
  isAppTokenMenu: boolean;
  openViewDrawer: (token: Linode.Token) => void;
  openEditDrawer: (token: Linode.Token) => void;
  openRevokeDialog: (token: Linode.Token, type: string) => void;
}

type CombinedProps = Props;

class APITokenMenu extends React.Component<CombinedProps> {
  createActions = () => {
    const {
      isAppTokenMenu,
      openViewDrawer,
      openEditDrawer,
      openRevokeDialog,
      token,
      type
    } = this.props;

    return (closeMenu: Function): Action[] => {
      const actions = !isAppTokenMenu
        ? [
            {
              title: 'View Token Scopes',
              onClick: (e: React.MouseEvent<HTMLElement>) => {
                openViewDrawer(token);
                closeMenu();
              }
            },
            {
              title: 'Rename Token',
              onClick: (e: React.MouseEvent<HTMLElement>) => {
                openEditDrawer(token);
                closeMenu();
              }
            },
            {
              title: 'Revoke',
              onClick: (e: React.MouseEvent<HTMLElement>) => {
                openRevokeDialog(token, type);
                closeMenu();
              }
            }
          ]
        : [
            {
              title: 'View Token Scopes',
              onClick: (e: React.MouseEvent<HTMLElement>) => {
                openViewDrawer(token);
                closeMenu();
              }
            },
            {
              title: 'Revoke',
              onClick: (e: React.MouseEvent<HTMLElement>) => {
                openRevokeDialog(token, type);
                closeMenu();
              }
            }
          ];
      return actions;
    };
  };

  render() {
    return <ActionMenu createActions={this.createActions()} />;
  }
}

export default APITokenMenu;

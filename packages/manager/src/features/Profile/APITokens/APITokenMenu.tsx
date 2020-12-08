import { Token } from '@linode/api-v4/lib/profile';
import * as React from 'react';

import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  token: Token;
  type: string;
  isThirdPartyAccessToken: boolean;
  openViewDrawer: (token: Token) => void;
  openEditDrawer: (token: Token) => void;
  openRevokeDialog: (token: Token, type: string) => void;
}

type CombinedProps = Props;

class APITokenMenu extends React.Component<CombinedProps> {
  createActions = () => {
    const {
      isThirdPartyAccessToken,
      openViewDrawer,
      openEditDrawer,
      openRevokeDialog,
      token,
      type
    } = this.props;

    return (closeMenu: Function): Action[] => {
      return !isThirdPartyAccessToken
        ? [
            {
              title: 'View Token Scopes',
              onClick: () => {
                openViewDrawer(token);
                closeMenu();
              }
            },
            {
              title: 'Rename Token',
              onClick: () => {
                openEditDrawer(token);
                closeMenu();
              }
            },
            {
              title: 'Revoke',
              onClick: () => {
                openRevokeDialog(token, type);
                closeMenu();
              }
            }
          ]
        : [
            {
              title: 'View Token Scopes',
              onClick: () => {
                openViewDrawer(token);
                closeMenu();
              }
            },
            {
              title: 'Revoke',
              onClick: () => {
                openRevokeDialog(token, type);
                closeMenu();
              }
            }
          ];
    };
  };

  render() {
    return (
      <ActionMenu
        createActions={this.createActions()}
        ariaLabel={`Action menu for API Token ${this.props.token.label}`}
      />
    );
  }
}

export default APITokenMenu;

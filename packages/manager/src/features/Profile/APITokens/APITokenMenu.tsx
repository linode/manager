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

    return (): Action[] => {
      const actions = !isThirdPartyAccessToken
        ? [
            {
              title: 'View Token Scopes',
              onClick: (e: React.MouseEvent<HTMLElement>) => {
                openViewDrawer(token);
              }
            },
            {
              title: 'Rename Token',
              onClick: (e: React.MouseEvent<HTMLElement>) => {
                openEditDrawer(token);
              }
            },
            {
              title: 'Revoke',
              onClick: (e: React.MouseEvent<HTMLElement>) => {
                openRevokeDialog(token, type);
              }
            }
          ]
        : [
            {
              title: 'View Token Scopes',
              onClick: (e: React.MouseEvent<HTMLElement>) => {
                openViewDrawer(token);
              }
            },
            {
              title: 'Revoke',
              onClick: (e: React.MouseEvent<HTMLElement>) => {
                openRevokeDialog(token, type);
              }
            }
          ];
      return actions;
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

import * as React from 'react';
import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  openSecretModal: (id: string, label: string) => void;
  openDeleteModal: (id: string, label: string) => void;
  openEditDrawer: (
    isPublic: boolean,
    redirectUri: string,
    label: string,
    clientID?: string
  ) => void;
  label: string;
  redirectUri: string;
  isPublic: boolean;
  clientID: string;
}

type CombinedProps = Props;

class OAuthClientActionMenu extends React.Component<CombinedProps> {
  createActions = () => {
    const { label, redirectUri, isPublic, clientID } = this.props;
    return (closeMenu: Function): Action[] => {
      const actions = [
        {
          title: 'Edit',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            this.props.openEditDrawer(isPublic, redirectUri, label, clientID);
            closeMenu();
          }
        },
        {
          title: 'Reset Secret',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            closeMenu();
            this.props.openSecretModal(clientID, label);
          }
        },
        {
          title: 'Delete',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            closeMenu();
            this.props.openDeleteModal(clientID, label);
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
        ariaLabel={`Action menu for OAuth Client ${this.props.label}`}
      />
    );
  }
}

export default OAuthClientActionMenu;

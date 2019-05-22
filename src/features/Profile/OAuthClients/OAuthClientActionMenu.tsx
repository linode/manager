import * as React from 'react';
import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  openSecretModal: (id: string) => void;
  openDeleteModal: (id: string) => void;
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
  createLinodeActions = () => {
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
            this.props.openSecretModal(clientID);
          }
        },
        {
          title: 'Delete',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            closeMenu();
            this.props.openDeleteModal(clientID);
          }
        }
      ];

      return actions;
    };
  };

  render() {
    return <ActionMenu createActions={this.createLinodeActions()} />;
  }
}

export default OAuthClientActionMenu;

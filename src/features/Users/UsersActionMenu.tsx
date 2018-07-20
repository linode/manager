import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  username: string;
  onProfile: () => void;
  onPermissions: () => void;
  onDelete: () => void;
}

type CombinedProps = Props & RouteComponentProps<{}>;

class UsersActionMenu extends React.Component<CombinedProps> {
  createActions = () => {
    const {
      onProfile,
      onPermissions,
      onDelete,
      username,
      history: { push },
    } = this.props;

    return (closeMenu: Function): Action[] => {
      const actions = [
        {
          title: 'User Profile',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            onProfile();
            closeMenu();
            push(`/users/${username}`)
            e.preventDefault();
          },
        },
        {
          title: 'User Permissions',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            onPermissions();
            closeMenu();
            push(`/users/${username}/permissions`)
            e.preventDefault();
          },
        },
        {
          disabled: true,
          title: 'Delete',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            onDelete();
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

export default withRouter(UsersActionMenu);

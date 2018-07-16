import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
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
    } = this.props;

    return (closeMenu: Function): Action[] => {
      const actions = [
        {
          disabled: true,
          title: 'User Profile',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            onProfile();
            closeMenu();
            e.preventDefault();
          },
        },
        {
          disabled: true,
          title: 'User Permissions',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            onPermissions();
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

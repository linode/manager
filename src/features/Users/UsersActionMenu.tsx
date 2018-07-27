import { pathOr } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  username: string;
  onDelete: (username: string) => void;
}

interface ConnectedProps {
  profileUsername: string;
}

type CombinedProps = Props & RouteComponentProps<{}> & ConnectedProps;

class UsersActionMenu extends React.Component<CombinedProps> {
  createActions = () => {
    const {
      onDelete,
      username,
      profileUsername,
      history: { push },
    } = this.props;

    return (closeMenu: Function): Action[] => {
      const actions = [
        {
          title: 'User Profile',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            closeMenu();
            push(`/users/${username}`)
            e.preventDefault();
          },
        },
        {
          title: 'User Permissions',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            closeMenu();
            push(`/users/${username}/permissions`)
            e.preventDefault();
          },
        },
        {
          disabled: username === profileUsername,
          title: 'Delete',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            onDelete(username);
            closeMenu();
            e.preventDefault();
          },
          tooltip: username === profileUsername
            ? 'You can\'t delete the currently active user.'
            : undefined,
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

const mapStateToProps = (state: Linode.AppState) => ({
  profileUsername: pathOr('', ['resources', 'profile', 'data', 'username'], state),
});

export const connected = connect(mapStateToProps);

export default withRouter(connected(UsersActionMenu));

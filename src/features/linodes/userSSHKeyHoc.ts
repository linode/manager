import { assoc, clone, map, path } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import { UserSSHKeyObject } from 'src/components/AccessPanel';
import { getUsers } from 'src/services/account';
import { getSSHKeys } from 'src/services/profile';
import { MapState } from 'src/store/types';
import { getAll } from 'src/utilities/getAll';
import { getEmailHash } from 'src/utilities/gravatar';

export interface UserSSHKeyProps {
  userSSHKeys: UserSSHKeyObject[];
  requestKeys: () => void;
}

export interface State {
  userSSHKeys: UserSSHKeyObject[];
  resetSSHKeys: () => void;
  requestKeys: () => void;
}

const getAllSSHKeys = getAll<Linode.SSHKey>(getSSHKeys);

const resetKeys = (key: UserSSHKeyObject) => {
  return assoc('selected', false, key);
};

export default (Component: React.ComponentType<any>) => {
  class WrappedComponent extends React.PureComponent<StateProps, State> {
    resetSSHKeys = () => {
      const { userSSHKeys } = this.state;
      const newKeys = map(resetKeys, userSSHKeys);
      this.setState({ userSSHKeys: newKeys });
    };

    requestKeys = () => {
      const { username, userEmailAddress } = this.props;
      const { userSSHKeys } = this.state;
      /**
       * We need a copy of the keys to track what was selected before requesting keys.
       * This will be an empty array on the initial request.
       */
      const oldKeys = clone(userSSHKeys);
      if (!username || !userEmailAddress) {
        return;
      }

      /**
       * This logic is redundant, but it is necessary because
       * restricted users can't make GET requests to /users
       * (they can't even view themselves through this endpoint)
       * so the only way to get their keys is through /profile/ssh_keys.
       */
      const isCurrentUserSelected = this.isUserSelected(username, oldKeys);
      getAllSSHKeys().then(response => {
        const keys = response.data;
        if (!this.mounted || !keys || keys.length === 0) {
          return;
        }
        this.setState({
          userSSHKeys: [
            this.createUserObject(
              username,
              userEmailAddress,
              keys.map(k => k.label),
              isCurrentUserSelected
            )
          ]
        });
      });

      getUsers()
        .then(response => {
          const users = response.data;
          if (!this.mounted || !users || users.length === 0) {
            return;
          }

          this.setState({
            userSSHKeys: [
              ...this.state.userSSHKeys,
              ...users.reduce((cleanedUsers, user) => {
                /**
                 * Don't re-add the current user
                 */
                if (user.username === username) {
                  return cleanedUsers;
                }
                const keys = user.ssh_keys;
                const isSelected = this.isUserSelected(user.username, oldKeys);

                return [
                  ...cleanedUsers,
                  this.createUserObject(
                    user.username,
                    user.email,
                    keys,
                    isSelected
                  )
                ];
              }, [])
            ]
          });
        })
        .catch(() => {
          /* We don't need to do anything here, we just don't add the keys. */
        });
    };

    state: State = {
      userSSHKeys: [],
      resetSSHKeys: this.resetSSHKeys,
      requestKeys: this.requestKeys
    };

    mounted: boolean = false;

    componentWillUnmount() {
      this.mounted = false;
    }

    componentDidMount() {
      this.mounted = true;
      this.requestKeys();
    }

    render() {
      return React.createElement(Component, {
        ...this.props,
        ...this.state
      });
    }

    toggleSSHUserKeys = (username: string, result: boolean) =>
      this.setState(state => ({
        ...state,
        userSSHKeys: state.userSSHKeys.map(user =>
          username === user.username ? { ...user, selected: result } : user
        )
      }));

    createUserObject = (
      username: string,
      email: string,
      keys: string[],
      selected: boolean = false
    ) => ({
      keys,
      username,
      gravatarUrl: `https://www.gravatar.com/avatar/${getEmailHash(
        email
      )}?d=mp&s=24`,
      selected,
      onSSHKeyChange: (_: any, result: boolean) =>
        this.toggleSSHUserKeys(username, result)
    });

    isUserSelected = (username: string, keys: UserSSHKeyObject[]) => {
      const currentUserKeys = keys.find(
        thisKey => thisKey.username === username
      );
      return currentUserKeys ? currentUserKeys.selected : false;
    };
  }

  return connected(WrappedComponent);
};

interface StateProps {
  username?: string;
  userEmailAddress?: string;
}

const mapStateToProps: MapState<StateProps, {}> = state => ({
  username: path<string>(['data', 'username'], state.__resources.profile),
  userEmailAddress: path<string>(['data', 'email'], state.__resources.profile)
});
const connected = connect(mapStateToProps);

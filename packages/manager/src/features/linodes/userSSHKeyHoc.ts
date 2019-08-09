import { assoc, clone, equals, map, path, pathOr } from 'ramda';
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
  sshError?: string;
}

export interface State {
  userSSHKeys: UserSSHKeyObject[];
  sshError?: string;
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
      const { isRestricted, username, userEmailAddress } = this.props;
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
       * Restricted users can't make GET requests to /users
       * (they can't even view themselves through this endpoint)
       * so the only way to get their keys is through /profile/ssh_keys.
       */

      if (isRestricted) {
        const isCurrentUserSelected = this.isUserSelected(username, oldKeys);
        getAllSSHKeys()
          .then(response => {
            const keys = response.data;
            if (!this.mounted || !keys || keys.length === 0) {
              return;
            }
            this.setState({
              sshError: undefined,
              userSSHKeys: [
                this.createUserObject(
                  username,
                  userEmailAddress,
                  keys.map(k => k.label),
                  isCurrentUserSelected
                )
              ]
            });
          })
          .catch(() => {
            this.setState({ sshError: 'Unable to load SSH keys' });
          });
      } else {
        getUsers()
          .then(response => {
            const users = response.data;
            if (!this.mounted || !users || users.length === 0) {
              return;
            }

            this.setState({
              sshError: undefined,
              userSSHKeys: [
                ...users.reduce((cleanedUsers, user) => {
                  const keys = user.ssh_keys;
                  const isSelected = this.isUserSelected(
                    user.username,
                    oldKeys,
                    keys
                  );

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
            this.setState({ sshError: 'Unable to load SSH keys' });
          });
      }
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

    isUserSelected = (
      username: string,
      keys: UserSSHKeyObject[],
      newKeys?: string[]
    ) => {
      /**
       * In most cases, we're just seeing if the current user was selected before
       * the current update (since the update is coming from the API, which doesn't track
       * this). However, if we're requesting the keys again because a new key has just been
       * added, we want to select the user who added the key by default. In this case,
       * pass the new list of keys for the target user and see if it's different from the
       * previous list. If it's different, a user has added a key (deletions or updates don't
       * affect this HOC in any way).
       *
       * The above paragraph doesn't make much sense, and points to a deeper problem in how
       * we manage SSH key state. @todo #TDT replace this HOC.
       */
      const currentUserKeys = keys.find(
        thisKey => thisKey.username === username
      );
      return currentUserKeys
        ? currentUserKeys.selected || !equals(currentUserKeys.keys, newKeys)
        : false;
    };
  }

  return connected(WrappedComponent);
};

interface StateProps {
  username?: string;
  userEmailAddress?: string;
  isRestricted: boolean;
}

const mapStateToProps: MapState<StateProps, {}> = state => ({
  username: path<string>(['data', 'username'], state.__resources.profile),
  userEmailAddress: path<string>(['data', 'email'], state.__resources.profile),
  isRestricted: pathOr(false, ['restricted'], state.__resources.profile.data)
});
const connected = connect(mapStateToProps);
